from pathlib import Path
import hashlib
import json

import pandas as pd
from sqlalchemy import create_engine, text

from app.core.config import settings


# ============================================================
# CONFIGURACIÓN
# ============================================================

EXCEL_FILE = Path(
    r"C:\Users\MARIELA\Downloads\datos-sismicos_Instrumental_1960-01-01_2026-10-17.xlsx"
)

SHEET_NAME = "IGP - Datos sísmicos"

SOURCE_NAME = "Catálogo Sísmico IGP"

BATCH_SIZE = 500


# ============================================================
# HASH DEL REGISTRO
# ============================================================

def make_hash(
    fecha,
    hora,
    latitud,
    longitud,
    profundidad,
    magnitud,
):
    value = "|".join(
        [
            str(fecha),
            str(hora),
            str(latitud),
            str(longitud),
            str(profundidad),
            str(magnitud),
        ]
    )

    return hashlib.sha256(
        value.encode("utf-8")
    ).hexdigest()


# ============================================================
# INICIO
# ============================================================

print("=" * 70)
print("SEPMS - IMPORTACIÓN CATÁLOGO SÍSMICO IGP")
print("=" * 70)


# ============================================================
# VERIFICAR ARCHIVO
# ============================================================

if not EXCEL_FILE.exists():
    raise FileNotFoundError(
        f"No existe el archivo:\n{EXCEL_FILE}"
    )

print(f"Archivo: {EXCEL_FILE}")
print(f"Hoja:   {SHEET_NAME}")


# ============================================================
# LEER EXCEL
# ============================================================

df = pd.read_excel(
    EXCEL_FILE,
    sheet_name=SHEET_NAME,
)

print(f"\nRegistros leídos: {len(df)}")
print("Columnas:", list(df.columns))


# ============================================================
# VALIDAR COLUMNAS
# ============================================================

expected_columns = [
    "fecha UTC",
    "hora UTC",
    "latitud (º)",
    "longitud (º)",
    "profundidad (km)",
    "magnitud (M)",
]

missing = [
    column
    for column in expected_columns
    if column not in df.columns
]

if missing:
    raise RuntimeError(
        "Faltan columnas del Excel: "
        + ", ".join(missing)
    )


# ============================================================
# NORMALIZAR NOMBRES
# ============================================================

df = df.rename(
    columns={
        "fecha UTC": "fecha",
        "hora UTC": "hora",
        "latitud (º)": "latitude",
        "longitud (º)": "longitude",
        "profundidad (km)": "depth_km",
        "magnitud (M)": "magnitude",
    }
)


# ============================================================
# CONVERTIR TIPOS
# ============================================================

df["fecha"] = pd.to_datetime(
    df["fecha"],
    errors="coerce",
)

df["latitude"] = pd.to_numeric(
    df["latitude"],
    errors="coerce",
)

df["longitude"] = pd.to_numeric(
    df["longitude"],
    errors="coerce",
)

df["depth_km"] = pd.to_numeric(
    df["depth_km"],
    errors="coerce",
)

df["magnitude"] = pd.to_numeric(
    df["magnitude"],
    errors="coerce",
)

df["hora"] = (
    df["hora"]
    .astype(str)
    .str.strip()
)


# ============================================================
# CREAR FECHA/HORA UTC
# ============================================================

df["origin_time_utc"] = pd.to_datetime(
    df["fecha"].dt.strftime("%Y-%m-%d")
    + " "
    + df["hora"],
    errors="coerce",
    utc=True,
)


# ============================================================
# VALIDACIÓN DE DATOS
# ============================================================

invalid = (
    df["origin_time_utc"].isna()
    | df["latitude"].isna()
    | df["longitude"].isna()
    | df["depth_km"].isna()
    | df["magnitude"].isna()
)

invalid |= ~df["latitude"].between(
    -90,
    90,
)

invalid |= ~df["longitude"].between(
    -180,
    180,
)

invalid |= df["depth_km"] < 0

invalid |= df["magnitude"] < 0


invalid_count = int(
    invalid.sum()
)


if invalid_count:
    print(
        f"\nRegistros inválidos descartados: "
        f"{invalid_count}"
    )


df = df.loc[
    ~invalid
].copy()


print(
    f"Registros válidos: {len(df)}"
)


# ============================================================
# CREAR HASH
# ============================================================

df["source_hash"] = df.apply(
    lambda row: make_hash(
        row["fecha"].strftime("%Y-%m-%d"),
        row["hora"],
        row["latitude"],
        row["longitude"],
        row["depth_km"],
        row["magnitude"],
    ),
    axis=1,
)


# ============================================================
# CONEXIÓN A SUPABASE
# ============================================================

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)


# ============================================================
# OBTENER FUENTE IGP
# ============================================================

with engine.connect() as db:

    source = db.execute(
        text(
            """
            SELECT id
            FROM data_sources
            WHERE name = :name
            LIMIT 1
            """
        ),
        {
            "name": SOURCE_NAME,
        },
    ).scalar_one_or_none()


if source is None:

    engine.dispose()

    raise RuntimeError(
        f"No existe la fuente '{SOURCE_NAME}' "
        "en la tabla data_sources."
    )


print(
    f"\nFuente IGP: {source}"
)


# ============================================================
# CREAR INGESTION RUN
# ============================================================

with engine.begin() as db:

    ingestion_id = db.execute(
        text(
            """
            INSERT INTO ingestion_runs (
                data_source_id,
                status,
                records_received,
                started_at
            )
            VALUES (
                :data_source_id,
                'running',
                :records_received,
                NOW()
            )
            RETURNING id
            """
        ),
        {
            "data_source_id": source,
            "records_received": len(df),
        },
    ).scalar_one()


print(
    f"Ingestion run: {ingestion_id}"
)


# ============================================================
# SQL DE INSERCIÓN
# ============================================================

insert_sql = text(
    """
    INSERT INTO seismic_events (
        external_id,
        source_record_id,
        data_source_id,
        ingestion_run_id,
        origin_time_utc,
        latitude,
        longitude,
        depth_km,
        magnitude,
        magnitude_type,
        reference_location,
        department,
        province,
        district,
        event_status,
        review_status,
        source_hash,
        raw_data,
        created_at,
        updated_at
    )
    VALUES (
        :external_id,
        :source_record_id,
        :data_source_id,
        :ingestion_run_id,
        :origin_time_utc,
        :latitude,
        :longitude,
        :depth_km,
        :magnitude,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'observed',
        'pending',
        :source_hash,
        CAST(:raw_data AS jsonb),
        NOW(),
        NOW()
    )
    ON CONFLICT (
        data_source_id,
        source_record_id
    )
    DO NOTHING
    """
)


# ============================================================
# CONTADORES
# ============================================================

inserted = 0
duplicated = 0
rejected = 0

total = len(df)


# ============================================================
# INSERTAR POR LOTES
# ============================================================

for start in range(
    0,
    total,
    BATCH_SIZE,
):

    batch = df.iloc[
        start:min(
            start + BATCH_SIZE,
            total,
        )
    ]

    batch_inserted = 0
    batch_duplicated = 0
    batch_rejected = 0


    # ========================================================
    # CADA LOTE TIENE SU PROPIA TRANSACCIÓN
    # ========================================================

    try:

        with engine.begin() as db:

            for index, row in batch.iterrows():

                # --------------------------------------------
                # ID DEL REGISTRO ORIGINAL DEL EXCEL
                # --------------------------------------------

                source_record_id = int(
                    index + 1
                )


                # --------------------------------------------
                # ID EXTERNO
                # --------------------------------------------

                external_id = (
                    f"IGP-{source_record_id:08d}"
                )


                # --------------------------------------------
                # DATOS RAW
                # --------------------------------------------

                raw_data = json.dumps(
                    {
                        "fecha_utc": row[
                            "fecha"
                        ].strftime(
                            "%Y-%m-%d"
                        ),

                        "hora_utc": row[
                            "hora"
                        ],

                        "latitud": float(
                            row["latitude"]
                        ),

                        "longitud": float(
                            row["longitude"]
                        ),

                        "profundidad_km": float(
                            row["depth_km"]
                        ),

                        "magnitud": float(
                            row["magnitude"]
                        ),
                    },
                    ensure_ascii=False,
                )


                # --------------------------------------------
                # INSERTAR
                # --------------------------------------------

                result = db.execute(
                    insert_sql,
                    {
                        "external_id": external_id,

                        "source_record_id":
                            source_record_id,

                        "data_source_id":
                            source,

                        "ingestion_run_id":
                            ingestion_id,

                        "origin_time_utc":
                            row[
                                "origin_time_utc"
                            ].to_pydatetime(),

                        "latitude":
                            float(
                                row["latitude"]
                            ),

                        "longitude":
                            float(
                                row["longitude"]
                            ),

                        "depth_km":
                            float(
                                row["depth_km"]
                            ),

                        "magnitude":
                            float(
                                row["magnitude"]
                            ),

                        "source_hash":
                            row[
                                "source_hash"
                            ],

                        "raw_data":
                            raw_data,
                    },
                )


                # --------------------------------------------
                # CONTAR RESULTADO
                # --------------------------------------------

                if result.rowcount == 1:

                    batch_inserted += 1

                else:

                    batch_duplicated += 1


    except Exception as exc:

        # ====================================================
        # SI FALLA EL LOTE COMPLETO:
        # SE HACE ROLLBACK DEL LOTE.
        #
        # LOS LOTES ANTERIORES YA CONFIRMADOS NO SE PIERDEN.
        # ====================================================

        batch_rejected = len(batch)

        print()

        print(
            "ERROR EN LOTE "
            f"{start + 1}-"
            f"{min(start + BATCH_SIZE, total)}"
        )

        print(
            f"Detalle: {exc}"
        )


    # ========================================================
    # ACUMULAR CONTADORES
    # ========================================================

    inserted += batch_inserted
    duplicated += batch_duplicated
    rejected += batch_rejected


    # ========================================================
    # PROGRESO
    # ========================================================

    processed = min(
        start + BATCH_SIZE,
        total,
    )

    print(
        f"Procesados: {processed}/{total} | "
        f"insertados: {inserted} | "
        f"duplicados: {duplicated} | "
        f"rechazados: {rejected}"
    )


# ============================================================
# DETERMINAR ESTADO FINAL
# ============================================================

if rejected == 0:

    status = "success"

elif inserted > 0:

    status = "partial"

else:

    status = "failed"


# ============================================================
# ACTUALIZAR INGESTION RUN
# ============================================================

with engine.begin() as db:

    db.execute(
        text(
            """
            UPDATE ingestion_runs
            SET
                status = :status,
                records_inserted = :inserted,
                records_duplicated = :duplicated,
                records_rejected = :rejected,
                finished_at = NOW()
            WHERE id = :id
            """
        ),
        {
            "id": ingestion_id,

            "status": status,

            "inserted": inserted,

            "duplicated": duplicated,

            "rejected": rejected,
        },
    )


# ============================================================
# CERRAR CONEXIÓN
# ============================================================

engine.dispose()


# ============================================================
# RESUMEN FINAL
# ============================================================

print()

print("=" * 70)
print("IMPORTACIÓN TERMINADA")
print("=" * 70)

print(
    f"Registros del Excel : {total}"
)

print(
    f"Insertados          : {inserted}"
)

print(
    f"Duplicados          : {duplicated}"
)

print(
    f"Rechazados          : {rejected}"
)

print(
    f"Estado              : {status}"
)

print("=" * 70)
