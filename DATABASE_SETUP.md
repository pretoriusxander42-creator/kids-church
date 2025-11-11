# Database Setup Guide

This guide will help you set up the database for the Kids Church Check-in System using Supabase.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase CLI** (optional but recommended): Install via npm
   ```bash
   npm install -g supabase
   ```

## Quick Setup (Via Supabase Dashboard)

### Step 1: Create a New Project

1. Log into [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter project details and create the project
4. Wait for the database to be provisioned

### Step 2: Get Connection Details

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - `URL` (Project URL)
   - `anon public` key
3. Update your `.env` file:
   ```bash
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 3: Run Migrations

You need to execute the SQL migration files in the `supabase/migrations/` directory in order:

1. Go to **SQL Editor** in your Supabase dashboard
2. Execute each migration file in order:
   - `20251111073521_create_users_table.sql`
   - `20251111073925_fix_users_rls_policy.sql`
   - `20251111080000_create_children_table.sql`
   - `20251111080100_create_parents_table.sql`
   - `20251111080200_create_relationships_table.sql`
   - `20251111080300_create_check_ins_table.sql`
   - `20251111080400_create_classes_table.sql`
   - `20251111080500_create_class_assignments_table.sql`
   - `20251111080600_create_special_needs_forms_table.sql`
   - `20251111080700_create_user_roles_table.sql`
   - `20251111080800_create_audit_logs_table.sql`
   - `20251111090000_add_email_verification.sql`

3. Copy and paste the contents of each file into the SQL Editor
4. Click "Run" to execute each migration

**Note**: Skip `20251111073940_disable_rls_for_testing.sql` - this was used during development only.

## Alternative: Using Supabase CLI

If you have the Supabase CLI installed:

### Step 1: Link Your Project

```bash
supabase login
supabase link --project-ref your-project-ref
```

### Step 2: Push Migrations

```bash
supabase db push
```

This will automatically apply all pending migrations.

## Verify Setup

After running migrations, verify your database setup:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `users`
   - `children`
   - `parents`
   - `parent_child_relationships`
   - `check_ins`
   - `classes`
   - `class_assignments`
   - `special_needs_forms`
   - `user_roles`
   - `audit_logs`

## Row Level Security (RLS)

All tables have RLS enabled. Policies are defined in the migration files. Key policies:

- **Users**: Can read/update their own data
- **Children/Parents**: Users can manage their own records
- **Check-ins**: Authenticated users can create/read check-ins
- **Classes**: Public read, admin write
- **Audit Logs**: Insert only for authenticated users

## Initial Data (Optional)

You may want to seed some initial data:

### Create an Admin User

```sql
-- First, register via the app to create a user
-- Then, update their role to admin
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Add Sample Classes

```sql
INSERT INTO classes (name, description, type, age_min, age_max, capacity, room_location)
VALUES 
  ('Nursery', 'Ages 0-2', 'regular', 0, 2, 15, 'Room 101'),
  ('Preschool', 'Ages 3-5', 'regular', 3, 5, 20, 'Room 102'),
  ('Elementary', 'Ages 6-10', 'regular', 6, 10, 25, 'Room 103'),
  ('FTV Board', 'First Time Visitors', 'ftv', 0, 18, NULL, 'Welcome Center');
```

## Troubleshooting

### Connection Issues

- Verify your Supabase URL and anon key are correct
- Check if your project is active in the Supabase dashboard
- Ensure your IP is not blocked (check Security settings)

### Migration Errors

- Make sure you're running migrations in order
- Check for any syntax errors in the SQL
- Verify you're using PostgreSQL 14+ (Supabase default)

### RLS Policy Issues

If you're having permission issues:
1. Check the RLS policies in the **Authentication** → **Policies** section
2. Ensure JWT tokens are being passed correctly in API requests
3. Verify user roles are set correctly in the `user_roles` table

## Email Configuration (Optional)

To enable email verification and notifications:

1. Go to **Authentication** → **Settings** in Supabase
2. Configure SMTP settings or use Supabase's built-in email service
3. Update your `.env` file with email credentials (see `.env.example`)
4. Install nodemailer: `npm install nodemailer @types/nodemailer`

## Support

For issues with:
- **Supabase Setup**: Check [Supabase Documentation](https://supabase.com/docs)
- **Application Setup**: See main `README.md`
- **Local Development**: See `Run_Locally.md`
