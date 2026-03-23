# Release Checklist

## 1. Environment

Make sure production has:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`

Use a long random value for `AUTH_SECRET`.

## 2. Supabase Database

Run:

- [supabase/user-management.sql](/Users/znbsystems/firestop-tracker/supabase/user-management.sql)

Confirm these tables exist:

- `app_users`
- `audit_logs`
- `project_memberships`

Confirm the `firestops` table includes:

- `room_zone`
- `location_description`
- `inspected_by`
- `inspection_date`
- `inspection_notes`

## 3. Supabase Storage

Confirm the storage bucket used by the app accepts:

- floorplan image uploads
- before/after firestop photo uploads

Test:

- upload floorplan image
- upload before photo
- upload after photo
- replace photo
- delete photo

## 4. Admin Access

Before go-live, make sure at least one active database user exists with role:

- `admin`

Log in with that account and confirm `/users` works.

## 5. Permissions Testing

Test these user types:

- `admin`
- `editor`
- `viewer`

Confirm:

- `admin` sees all projects
- `editor` sees only assigned projects and can edit them
- `viewer` sees only assigned projects and cannot edit
- direct URL access to unassigned projects is blocked

## 6. Project Workflow Testing

Test:

- create project
- edit project
- delete project
- assign project access to a user

## 7. Floorplan Workflow Testing

Test:

- create floorplan
- rename floorplan
- delete floorplan
- upload floorplan image

## 8. Firestop Workflow Testing

Test:

- add pin
- move pin
- update firestop details
- save installation info
- save inspection info
- delete firestop

## 9. Reporting Testing

Test:

- project report page
- floorplan report page
- CSV export
- browser print / save PDF

## 10. Mobile Testing

Test on a phone:

- sign in
- open home dashboard
- open project page
- open floorplan page
- use report/export buttons
- confirm layouts do not break

## 11. Audit Testing

Confirm audit entries are created for:

- login / logout
- user create / update / delete
- project access changes
- project create / update / delete
- floorplan create / update / delete
- firestop create / update / delete
- firestop move
- floorplan image upload
- firestop photo upload / delete

## 12. Pre-Deploy Final Check

Run:

```bash
npm run lint
./node_modules/.bin/tsc --noEmit
```

If both pass and the workflow tests above are good, the app is ready for deployment.
