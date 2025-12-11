/*
  # HRMS Timesheet Management System - Database Schema

  ## Overview
  This migration creates the complete database schema for an HRMS timesheet management system
  with three user roles: Employee, Manager, and Admin.

  ## Tables Created

  ### 1. profiles
  Extends auth.users with role and additional user information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'employee', 'manager', or 'admin'
  - `manager_id` (uuid, nullable) - References manager for employees
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. projects
  Stores project information for timesheet tracking
  - `id` (uuid, primary key) - Unique project identifier
  - `name` (text) - Project name
  - `description` (text) - Project description
  - `status` (text) - Project status: 'active' or 'inactive'
  - `created_by` (uuid) - References admin who created the project
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. timesheets
  Stores timesheet entries
  - `id` (uuid, primary key) - Unique timesheet identifier
  - `employee_id` (uuid) - References employee who created the timesheet
  - `project_id` (uuid) - References associated project
  - `date` (date) - Date of work
  - `task_description` (text) - Description of task performed
  - `hours_worked` (numeric) - Number of hours worked
  - `notes` (text, nullable) - Additional notes
  - `status` (text) - Status: 'draft', 'submitted', 'approved', 'rejected'
  - `submitted_at` (timestamptz, nullable) - Submission timestamp
  - `reviewed_at` (timestamptz, nullable) - Review timestamp
  - `reviewed_by` (uuid, nullable) - References manager who reviewed
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. timesheet_comments
  Stores manager feedback on timesheets (especially for rejections)
  - `id` (uuid, primary key) - Unique comment identifier
  - `timesheet_id` (uuid) - References timesheet
  - `commenter_id` (uuid) - References user who commented
  - `comment` (text) - Comment text
  - `created_at` (timestamptz) - Comment creation timestamp

  ## Security
  - Row Level Security (RLS) is enabled on all tables
  - Employees can only view/edit their own timesheets
  - Managers can view timesheets of their team members
  - Admins have full access to all data
  - Policies enforce role-based access control
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
  manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  date date NOT NULL,
  task_description text NOT NULL,
  hours_worked numeric(5,2) NOT NULL CHECK (hours_worked > 0 AND hours_worked <= 24),
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

-- Create timesheet_comments table
CREATE TABLE IF NOT EXISTS timesheet_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id uuid NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  commenter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timesheet_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_timesheets_employee_id ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_project_id ON timesheets(project_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_date ON timesheets(date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON profiles(manager_id);

-- RLS Policies for profiles table
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for projects table
CREATE POLICY "All authenticated users can view active projects"
  ON projects FOR SELECT
  TO authenticated
  USING (status = 'active' OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for timesheets table
CREATE POLICY "Employees can view own timesheets"
  ON timesheets FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles emp
        WHERE emp.id = timesheets.employee_id
        AND emp.manager_id = p.id
      )
    )
  );

CREATE POLICY "Employees can insert own timesheets"
  ON timesheets FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own draft timesheets"
  ON timesheets FOR UPDATE
  TO authenticated
  USING (
    (employee_id = auth.uid() AND status = 'draft') OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles emp
        WHERE emp.id = timesheets.employee_id
        AND emp.manager_id = p.id
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    (employee_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles emp
        WHERE emp.id = timesheets.employee_id
        AND emp.manager_id = p.id
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Employees can delete own draft timesheets"
  ON timesheets FOR DELETE
  TO authenticated
  USING (employee_id = auth.uid() AND status = 'draft');

-- RLS Policies for timesheet_comments table
CREATE POLICY "Users can view comments on accessible timesheets"
  ON timesheet_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timesheets
      WHERE timesheets.id = timesheet_comments.timesheet_id
      AND (
        timesheets.employee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        ) OR
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() 
          AND p.role = 'manager'
          AND EXISTS (
            SELECT 1 FROM profiles emp
            WHERE emp.id = timesheets.employee_id
            AND emp.manager_id = p.id
          )
        )
      )
    )
  );

CREATE POLICY "Managers and admins can insert comments"
  ON timesheet_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    commenter_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at
  BEFORE UPDATE ON timesheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
