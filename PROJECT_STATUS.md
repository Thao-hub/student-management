# Project Status

## Current State

Status: `Active development`

The project is runnable and covers the main internal workflows:
- Authentication via issued accounts
- Student CRUD, detail view, bulk import, bulk delete
- Class, subject, score, teacher, room, term, schedule, enrollment, and attendance management pages
- Role-gated write actions for admin/teacher users

It is not fully complete. Some planned or previously documented capabilities are intentionally disabled or not implemented yet.

## What Was Aligned

Recent cleanup brought the codebase closer to the real product state:
- Auth docs no longer imply that public registration and token refresh are available
- Class UI no longer exposes `description`, because the current database schema does not persist it
- Subject UI no longer exposes editable `is_active`, because the current schema treats subjects as always active
- Minimal backend tests were added for login, student import, and bulk delete

## Working Areas

- `Auth`: login works; public registration is disabled; refresh token is not implemented
- `Students`: list, detail, create, update, delete, import, bulk delete
- `Classes`: CRUD with current schema-backed fields
- `Subjects`: CRUD with current schema-backed fields
- `Scores`: CRUD and detail views
- `Teachers`: CRUD
- `Terms`, `Rooms`, `Schedule`, `Enrollments`, `Attendance`: CRUD pages and API routes are present

## Known Gaps

- Automated test coverage is still minimal and should be expanded beyond auth/student flows
- Documentation outside `README.md` may still contain optimistic or outdated statements
- The app still relies on simple browser alerts/confirms in several flows
- Dashboard aggregation is computed client-side from full list endpoints rather than a dedicated summary endpoint

## Recommended Next Steps

1. Add more API and UI tests for teachers, classes, subjects, scores, and auth edge cases.
2. Audit the remaining docs (`QUICK_START.md`, `DEVELOPER_GUIDE.md`, `IMPLEMENTATION_GUIDE.md`) for stale claims.
3. Replace `window.alert` / `window.confirm` with consistent in-app notifications and dialogs.
4. Add server-side summary endpoints or pagination where list sizes may grow.

## Last Updated

April 29, 2026
