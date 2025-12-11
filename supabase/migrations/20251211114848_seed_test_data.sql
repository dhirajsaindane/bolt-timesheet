/*
  # Seed Test Data for HRMS

  ## Overview
  This migration creates test user accounts and sample data for the HRMS system.

  ## Test Accounts Created

  ### Admin Account
  - Email: admin@hrms.com
  - Password: admin123
  - Role: admin

  ### Manager Accounts
  - Email: manager@hrms.com
  - Password: manager123
  - Role: manager

  - Email: manager2@hrms.com
  - Password: manager123
  - Role: manager

  ### Employee Accounts
  - Email: employee@hrms.com
  - Password: employee123
  - Role: employee
  - Manager: manager@hrms.com

  - Email: employee2@hrms.com
  - Password: employee123
  - Role: employee
  - Manager: manager@hrms.com

  - Email: employee3@hrms.com
  - Password: employee123
  - Role: employee
  - Manager: manager2@hrms.com

  - Email: employee4@hrms.com
  - Password: employee123
  - Role: employee
  - Manager: manager2@hrms.com

  ## Sample Data
  - 5 active projects
  - Sample timesheets with various statuses
  - Sample manager feedback comments

  ## Important Notes
  - All test accounts use simple passwords for development purposes only
  - These should NOT be used in production environments
  - Passwords can be changed after first login
*/

DO $$
DECLARE
  admin_id uuid;
  manager1_id uuid;
  manager2_id uuid;
  employee1_id uuid;
  employee2_id uuid;
  employee3_id uuid;
  employee4_id uuid;
  project1_id uuid;
  project2_id uuid;
  project3_id uuid;
  project4_id uuid;
  project5_id uuid;
  timesheet1_id uuid;
  timesheet2_id uuid;
BEGIN
  admin_id := gen_random_uuid();
  manager1_id := gen_random_uuid();
  manager2_id := gen_random_uuid();
  employee1_id := gen_random_uuid();
  employee2_id := gen_random_uuid();
  employee3_id := gen_random_uuid();
  employee4_id := gen_random_uuid();

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@hrms.com', crypt('admin123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
    (manager1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@hrms.com', crypt('manager123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
    (manager2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager2@hrms.com', crypt('manager123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
    (employee1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'employee@hrms.com', crypt('employee123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
    (employee2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'employee2@hrms.com', crypt('employee123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
    (employee3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'employee3@hrms.com', crypt('employee123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
    (employee4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'employee4@hrms.com', crypt('employee123', gen_salt('bf')), now(), now(), now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), admin_id, admin_id, format('{"sub":"%s","email":"admin@hrms.com"}', admin_id)::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), manager1_id, manager1_id, format('{"sub":"%s","email":"manager@hrms.com"}', manager1_id)::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), manager2_id, manager2_id, format('{"sub":"%s","email":"manager2@hrms.com"}', manager2_id)::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), employee1_id, employee1_id, format('{"sub":"%s","email":"employee@hrms.com"}', employee1_id)::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), employee2_id, employee2_id, format('{"sub":"%s","email":"employee2@hrms.com"}', employee2_id)::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), employee3_id, employee3_id, format('{"sub":"%s","email":"employee3@hrms.com"}', employee3_id)::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), employee4_id, employee4_id, format('{"sub":"%s","email":"employee4@hrms.com"}', employee4_id)::jsonb, 'email', now(), now(), now())
  ON CONFLICT (provider_id, provider) DO NOTHING;

  INSERT INTO profiles (id, email, full_name, role, manager_id)
  VALUES
    (admin_id, 'admin@hrms.com', 'Admin User', 'admin', NULL),
    (manager1_id, 'manager@hrms.com', 'Sarah Johnson', 'manager', NULL),
    (manager2_id, 'manager2@hrms.com', 'Michael Chen', 'manager', NULL),
    (employee1_id, 'employee@hrms.com', 'John Smith', 'employee', manager1_id),
    (employee2_id, 'employee2@hrms.com', 'Emily Davis', 'employee', manager1_id),
    (employee3_id, 'employee3@hrms.com', 'Robert Wilson', 'employee', manager2_id),
    (employee4_id, 'employee4@hrms.com', 'Lisa Anderson', 'employee', manager2_id)
  ON CONFLICT (id) DO NOTHING;

  project1_id := gen_random_uuid();
  project2_id := gen_random_uuid();
  project3_id := gen_random_uuid();
  project4_id := gen_random_uuid();
  project5_id := gen_random_uuid();

  INSERT INTO projects (id, name, description, status, created_by)
  VALUES
    (project1_id, 'Website Redesign', 'Complete overhaul of company website with modern design and improved UX', 'active', admin_id),
    (project2_id, 'Mobile App Development', 'Native mobile app for iOS and Android platforms', 'active', admin_id),
    (project3_id, 'Database Migration', 'Migrate legacy database to new cloud infrastructure', 'active', admin_id),
    (project4_id, 'Customer Portal', 'Self-service portal for customers to manage their accounts', 'active', admin_id),
    (project5_id, 'Internal Tools', 'Development of internal productivity tools and dashboards', 'active', admin_id)
  ON CONFLICT (id) DO NOTHING;

  timesheet1_id := gen_random_uuid();
  timesheet2_id := gen_random_uuid();

  INSERT INTO timesheets (id, employee_id, project_id, date, task_description, hours_worked, notes, status, submitted_at, reviewed_at, reviewed_by)
  VALUES
    (gen_random_uuid(), employee1_id, project1_id, CURRENT_DATE - 5, 'Designed new homepage layout and created mockups', 8.0, 'Completed initial design concepts', 'approved', CURRENT_DATE - 4, CURRENT_DATE - 3, manager1_id),
    (gen_random_uuid(), employee1_id, project1_id, CURRENT_DATE - 4, 'Implemented responsive navigation menu', 6.5, '', 'approved', CURRENT_DATE - 3, CURRENT_DATE - 2, manager1_id),
    (gen_random_uuid(), employee1_id, project2_id, CURRENT_DATE - 3, 'Set up React Native development environment', 4.0, 'Encountered some dependency issues, resolved', 'approved', CURRENT_DATE - 2, CURRENT_DATE - 1, manager1_id),
    (timesheet1_id, employee1_id, project2_id, CURRENT_DATE - 2, 'Implemented user authentication flow', 7.5, '', 'submitted', CURRENT_DATE - 1, NULL, NULL),
    (gen_random_uuid(), employee1_id, project1_id, CURRENT_DATE - 1, 'Working on homepage components', 5.0, '', 'draft', NULL, NULL, NULL),
    (gen_random_uuid(), employee2_id, project3_id, CURRENT_DATE - 5, 'Analyzed current database schema and dependencies', 8.0, '', 'approved', CURRENT_DATE - 4, CURRENT_DATE - 3, manager1_id),
    (gen_random_uuid(), employee2_id, project3_id, CURRENT_DATE - 4, 'Created migration scripts for user tables', 7.0, '', 'approved', CURRENT_DATE - 3, CURRENT_DATE - 2, manager1_id),
    (timesheet2_id, employee2_id, project3_id, CURRENT_DATE - 3, 'Testing migration scripts', 3.0, 'Need to add more test cases', 'rejected', CURRENT_DATE - 2, CURRENT_DATE - 1, manager1_id),
    (gen_random_uuid(), employee2_id, project4_id, CURRENT_DATE - 2, 'Designed customer dashboard wireframes', 6.0, '', 'submitted', CURRENT_DATE - 1, NULL, NULL),
    (gen_random_uuid(), employee3_id, project4_id, CURRENT_DATE - 5, 'Built authentication API endpoints', 8.0, '', 'approved', CURRENT_DATE - 4, CURRENT_DATE - 3, manager2_id),
    (gen_random_uuid(), employee3_id, project4_id, CURRENT_DATE - 4, 'Implemented session management', 7.5, '', 'approved', CURRENT_DATE - 3, CURRENT_DATE - 2, manager2_id),
    (gen_random_uuid(), employee3_id, project5_id, CURRENT_DATE - 3, 'Created analytics dashboard prototype', 6.0, '', 'submitted', CURRENT_DATE - 2, NULL, NULL),
    (gen_random_uuid(), employee4_id, project5_id, CURRENT_DATE - 5, 'Developed data visualization components', 8.0, '', 'approved', CURRENT_DATE - 4, CURRENT_DATE - 3, manager2_id),
    (gen_random_uuid(), employee4_id, project5_id, CURRENT_DATE - 4, 'Integrated chart libraries and tested performance', 7.0, '', 'approved', CURRENT_DATE - 3, CURRENT_DATE - 2, manager2_id),
    (gen_random_uuid(), employee4_id, project2_id, CURRENT_DATE - 3, 'Built user profile screens', 8.0, '', 'submitted', CURRENT_DATE - 2, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO timesheet_comments (timesheet_id, commenter_id, comment)
  VALUES
    (timesheet2_id, manager1_id, 'The test coverage is insufficient. Please add comprehensive unit tests for all migration scripts before resubmitting.')
  ON CONFLICT DO NOTHING;

END $$;
