export type RulePriority = "Crítica" | "Alta" | "Media" | "Baja";
export type RuleCondition = "mayor" | "menor" | "igual";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: RuleCondition;
  threshold: number;
  unit: string;
  priority: RulePriority;
  enabled: boolean;
  channel: string;
  created_at?: string;
  updated_at?: string;
}

