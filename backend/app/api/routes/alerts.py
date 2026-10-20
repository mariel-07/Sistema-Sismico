from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.alert import AlertRecord, AlertRule

router = APIRouter(tags=["Alerts and Rules"])


class RuleInput(BaseModel):
    name: str = Field(min_length=3, max_length=150)
    description: str = ""
    metric: str = Field(min_length=1, max_length=80)
    condition: str = Field(pattern="^(mayor|menor|igual)$")
    threshold: float = Field(ge=0)
    unit: str = ""
    priority: str = Field(pattern="^(Crítica|Alta|Media|Baja)$")
    enabled: bool = True
    channel: str = "Sistema"


class RuleOutput(RuleInput):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


class AlertInput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    message: str
    source: str = "Sistema"
    priority: str = Field(pattern="^(Crítica|Alta|Media|Baja)$")
    status: str = Field(default="Pendiente", pattern="^(Pendiente|Revisada|Atendida)$")
    event_code: str = ""
    is_read: bool = False


class AlertOutput(AlertInput):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime


@router.get("/alert-rules", response_model=list[RuleOutput])
def list_rules(db: Session = Depends(get_db)):
    return list(db.scalars(select(AlertRule).order_by(AlertRule.created_at.desc())).all())


@router.post("/alert-rules", response_model=RuleOutput, status_code=201)
def create_rule(data: RuleInput, db: Session = Depends(get_db)):
    rule = AlertRule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/alert-rules/{rule_id}", response_model=RuleOutput)
def update_rule(rule_id: UUID, data: RuleInput, db: Session = Depends(get_db)):
    rule = db.get(AlertRule, rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    for key, value in data.model_dump().items():
        setattr(rule, key, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/alert-rules/{rule_id}", status_code=204)
def delete_rule(rule_id: UUID, db: Session = Depends(get_db)):
    rule = db.get(AlertRule, rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    db.delete(rule)
    db.commit()


@router.get("/alerts", response_model=list[AlertOutput])
def list_alerts(db: Session = Depends(get_db)):
    return list(db.scalars(select(AlertRecord).order_by(AlertRecord.created_at.desc())).all())


@router.post("/alerts", response_model=AlertOutput, status_code=201)
def create_alert(data: AlertInput, db: Session = Depends(get_db)):
    alert = AlertRecord(**data.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/alerts/{alert_id}", response_model=AlertOutput)
def update_alert(alert_id: UUID, data: dict, db: Session = Depends(get_db)):
    alert = db.get(AlertRecord, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    allowed = {"title", "message", "source", "priority", "status", "event_code", "is_read"}
    for key, value in data.items():
        if key not in allowed:
            raise HTTPException(status_code=422, detail=f"Campo no permitido: {key}")
        setattr(alert, key, value)
    db.commit()
    db.refresh(alert)
    return alert
