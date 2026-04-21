export type Study = {
  id: string;
  name: string;
  client_name: string;
  location: string;
  project_type: string;
  voltage: string;
  created_at: string;
  updated_at: string;
};

export type AssessmentInput = {
  study_id?: string;
  circuit_id: string;
  current_project_a: number;
  conductor_mm2: number;
  breaker_a: number;
  voltage_drop_percent: number;
  installation_method: string;
  environment_type: string;
  standard_code: string;
  standard_version: string;
};

export type AssessmentRule = {
  rule_id: string;
  origin_type: string;
  origin_name: string;
  hierarchy_weight: number;
  type_conflict?: string;
  severity: string;
  message: string;
};

export type Verdict = {
  study_id: string;
  circuit_id: string;
  status: string;
  severity: string;
  standard_code: string;
  standard_name: string;
  standard_version: string;
  standard_hierarchy: number;
  rules_applied: AssessmentRule[];
  messages: string[];
  requires_human_review: boolean;
};

export type AssessmentRecord = {
  id: string;
  study_id: string;
  input: AssessmentInput;
  verdict: Verdict;
  created_at: string;
};

export type StudyDetail = {
  study: Study;
  assessments: AssessmentRecord[];
};

export type Standard = {
  code: string;
  title: string;
  domain: string;
  subject: string;
  version: string;
  status: string;
  source_type: string;
  source_name?: string;
  hierarchy_weight: number;
  applies_to?: string[];
  notes?: string[];
};
