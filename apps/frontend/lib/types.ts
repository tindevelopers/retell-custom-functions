export type Role = 'super_admin' | 'client_admin' | 'user';

export type AppUser = {
  id: string;
  email: string;
  name?: string;
  role: Role;
  assignedClients: string[];
};

export type TimeWindow = {
  start: string;
  end: string;
};

export type FunctionConfig = {
  enabled: boolean;
  timezone: string;
  days_of_week: string[];
  windows: TimeWindow[];
  transfer_number?: string;
  deny_message?: string;
};

export type ProjectConfig = {
  project_id: string;
  functions: Record<string, FunctionConfig>;
};

