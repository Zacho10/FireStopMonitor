# Firestop Tracker

Firestop Tracker is a Next.js app for managing projects, floorplans, firestop pins, before/after photos, inspection data, reporting, and project-specific user access.

## Main Features

- Project CRUD
- Floorplan CRUD
- Firestop pin placement and editing
- Before/after photo uploads
- Project-level permissions
- Database-backed users and roles
- Audit trail
- Project and floorplan reporting
- CSV export
- Mobile-polished UI

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If you want to test from a phone on the same network, open the app using your computer's local IP address after starting the dev server.

## Required Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AUTH_SECRET=...
```

Optional bootstrap users:

```env
APP_USERS_JSON=[{"username":"admin","password":"firestop123","name":"Administrator","role":"admin"}]
```

## Database Setup

Run the SQL file below in Supabase SQL Editor:

- [supabase/user-management.sql](/Users/znbsystems/firestop-tracker/supabase/user-management.sql)

Also make sure the `firestops` table includes these optional fields if they are not already present:

```sql
alter table public.firestops
  add column if not exists room_zone text,
  add column if not exists location_description text,
  add column if not exists inspected_by text,
  add column if not exists inspection_date date,
  add column if not exists inspection_notes text;
```

## Storage

The app expects Supabase storage uploads for:

- floorplan images
- firestop photos

## Auth and Access

- `admin`: full access, user management, project access management
- `editor`: can edit only projects assigned to them
- `viewer`: read-only access to assigned projects

## Reports

- Project report page
- Floorplan report page
- CSV export
- Browser print / save as PDF flow

## Release Notes

Before deploying or handing this to users, use:

- [RELEASE-CHECKLIST.md](/Users/znbsystems/firestop-tracker/RELEASE-CHECKLIST.md)
