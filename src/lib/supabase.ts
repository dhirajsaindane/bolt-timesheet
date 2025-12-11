import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'employee' | 'manager' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Timesheet {
  id: string;
  employee_id: string;
  project_id: string;
  date: string;
  task_description: string;
  hours_worked: number;
  notes: string;
  status: TimesheetStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
  employee?: Profile;
  reviewer?: Profile;
}

export interface TimesheetComment {
  id: string;
  timesheet_id: string;
  commenter_id: string;
  comment: string;
  created_at: string;
  commenter?: Profile;
}
