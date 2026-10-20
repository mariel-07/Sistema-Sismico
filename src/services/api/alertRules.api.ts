import { apiClient } from "./client";

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
  created_at: string;
  updated_at: string;
}

export type AlertRuleInput = Omit<AlertRule, "id" | "created_at" | "updated_at">;

export async function getAlertRules(): Promise<AlertRule[]> {
  const { data } = await apiClient.get<AlertRule[]>("/alert-rules");
  return data;
}

export async function createAlertRule(input: AlertRuleInput): Promise<AlertRule> {
  const { data } = await apiClient.post<AlertRule>("/alert-rules", input);
  return data;
}

export async function updateAlertRule(id: string, input: AlertRuleInput): Promise<AlertRule> {
  const { data } = await apiClient.put<AlertRule>(`/alert-rules/${id}`, input);
  return data;
}

export async function deleteAlertRule(id: string): Promise<void> {
  await apiClient.delete(`/alert-rules/${id}`);
}
