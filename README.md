# HRMS - Human Resource Management System

A complete timesheet management system built with React, TypeScript, Tailwind CSS, and Supabase. This application supports three distinct user roles (Employee, Manager, Admin) with role-based access control and comprehensive timesheet management features.

## Features

### Employee Role
- Create, edit, and delete draft timesheets
- Submit timesheets for manager approval
- View timesheet history with status indicators (draft, submitted, approved, rejected)
- View manager feedback on rejected timesheets
- Filter timesheets by status

### Manager Role
- Dashboard with pending approval statistics
- Approve or reject team member timesheets
- Add mandatory comments when rejecting timesheets
- Filter timesheets by employee, project, date range, and status
- View team timesheet history
- Real-time statistics for pending, approved, and rejected timesheets

### Admin Role
- Comprehensive analytics dashboard with data visualization
- User management (create, edit, delete employees and managers)
- Project management (create, edit, delete, activate/deactivate projects)
- System-wide reporting with filters
- Export timesheet data to CSV
- Visual charts showing hours by project and employee
- Status distribution analytics

## Tech Stack

- **Frontend:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Build Tool:** Vite

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (already configured)

## Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. The environment variables are already configured in `.env`:
```
VITE_SUPABASE_URL=https://uvylnypweboyuclvgstn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Test Accounts

The system comes pre-configured with test accounts for each role:

### Admin Account
- **Email:** admin@hrms.com
- **Password:** admin123
- **Access:** Full system access, user management, project management, analytics

### Manager Accounts
- **Email:** manager@hrms.com
- **Password:** manager123
- **Team:** John Smith, Emily Davis

- **Email:** manager2@hrms.com
- **Password:** manager123
- **Team:** Robert Wilson, Lisa Anderson

### Employee Accounts
- **Email:** employee@hrms.com
- **Password:** employee123
- **Manager:** Sarah Johnson

- **Email:** employee2@hrms.com
- **Password:** employee123
- **Manager:** Sarah Johnson

- **Email:** employee3@hrms.com
- **Password:** employee123
- **Manager:** Michael Chen

- **Email:** employee4@hrms.com
- **Password:** employee123
- **Manager:** Michael Chen

## Database Schema

### Tables

1. **profiles** - Extends auth.users with role information
   - Links to Supabase Auth users
   - Stores role (employee, manager, admin)
   - Manager assignment for employees

2. **projects** - Project information
   - Name, description, status
   - Created by admin users

3. **timesheets** - Timesheet entries
   - Date, project, task description, hours
   - Status workflow: draft → submitted → approved/rejected
   - Tracks reviewer and review timestamps

4. **timesheet_comments** - Manager feedback
   - Comments on timesheets (especially rejections)
   - Visible to employees

### Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control policies
- Employees can only view/edit their own timesheets
- Managers can view/approve timesheets from their team
- Admins have full system access

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AnalyticsView.tsx
│   │   ├── UserManagement.tsx
│   │   └── ProjectManagement.tsx
│   ├── employee/
│   │   ├── EmployeeDashboard.tsx
│   │   ├── TimesheetForm.tsx
│   │   └── TimesheetList.tsx
│   ├── manager/
│   │   ├── ManagerDashboard.tsx
│   │   └── TimesheetApproval.tsx
│   ├── Layout.tsx
│   ├── Login.tsx
│   └── LoadingSpinner.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Key Features Implementation

### Authentication Flow
- Secure login with Supabase Auth
- Role-based routing
- Session management with automatic refresh

### Timesheet Workflow
1. Employee creates timesheet in draft status
2. Employee can edit/delete draft timesheets
3. Employee submits for approval
4. Manager approves or rejects with comments
5. Rejected timesheets can be viewed by employee with feedback

### Analytics & Reporting
- Real-time data aggregation
- Visual charts using CSS-based progress bars
- Export functionality to CSV
- Comprehensive filtering options

### User Management
- Create users with email/password
- Assign roles and managers
- Edit user information
- Delete users (with cascade handling)

### Project Management
- Create and manage projects
- Set project status (active/inactive)
- Only active projects shown to employees
- All projects visible to admins and managers

## Development Timeline

**Total Implementation Time: ~6-8 hours**

- Database schema design and migrations: 1 hour
- Authentication system: 30 minutes
- Employee interface: 1.5 hours
- Manager interface: 1.5 hours
- Admin interface with analytics: 2 hours
- Testing and refinement: 1.5 hours
- Documentation: 1 hour

## Assumptions Made

1. **Email-based Authentication**: Using Supabase's built-in email/password auth without email verification for simplicity
2. **Single Manager Assignment**: Each employee has one manager (not multiple reporting lines)
3. **Project-based Tracking**: Timesheets must be associated with a project
4. **Simple Approval Workflow**: Single-level approval (no multi-stage approvals)
5. **Hours Validation**: 0.5 to 24 hours per timesheet entry
6. **No Time Tracking**: Manual entry system (not automated time tracking)
7. **Comments on Rejection**: Required comments when rejecting, optional otherwise

## Future Enhancements

- Multi-level approval workflows
- Email notifications for submissions and approvals
- Time tracking integration
- Mobile responsive optimizations
- Bulk operations (approve multiple timesheets)
- Advanced reporting with date range comparisons
- Department-based organization
- Leave management integration
- Overtime tracking and calculations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for demonstration purposes.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
