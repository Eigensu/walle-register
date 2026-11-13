# Admin panel

A standalone admin panel for any event that runs on `apps/backend`. It doesn't depend on any
event frontend (`apps/frontend`, `apps/syf-frontend`, or a future one): it talks only to the
backend, and every frontend already reads the open/closed state and cap from the backend's
public `GET /api/config`.

What it does:

- **Overview**: registration counts, open/close the registration form, set the registration cap.
- **Players**: search, filter by status, paginate, export CSV, and open any player to see every
  field they registered with plus their payment attempts. Fields are shown generically, so a new
  event's form can add fields without changing this app.
- **Admins**: list everyone who can sign in, add admins, remove them.

## Run it

```bash
cp apps/admin/.env.example apps/admin/.env.local   # set ADMIN_API_URL
pnpm --dir apps/admin dev                          # http://localhost:3002
```

| Variable                  | Purpose                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| `ADMIN_API_URL`           | The event backend to manage. Server-side only; `/api/*` and `/uploads/*` are proxied to it. |
| `NEXT_PUBLIC_ADMIN_TITLE` | Name in the header and browser tab, e.g. `JMCL Season 2`.              |

## One deploy per event

Each event has its own backend, so deploy this app once per event with that event's
`ADMIN_API_URL` (for example `admin.jmcl…` → JMCL backend, `admin.syf…` → SYF backend). Same
code, no changes needed for a new event.

## Sign-in and admins

- The **owner** is `ADMIN_USERNAME` / `ADMIN_PASSWORD` from the backend's env. It always works and
  can't be removed from the panel (use it to recover access).
- Other admins are stored in the backend's `admins` collection (bcrypt-hashed passwords) and are
  managed from the Admins page. Removing one signs them out immediately.
- Sign-in returns a token valid for 12 hours. It's signed with `ADMIN_JWT_SECRET` on the backend,
  or, if that's unset, a key derived from `ADMIN_PASSWORD`. Changing either signs everyone out.

## Backend API

All routes live in `apps/backend/app/routers/admin_panel.py` under `/api/admin-panel` and need
`Authorization: Bearer <token>` (except `/login`):

| Method & path                  | Does                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `POST /login`                  | `{username, password}` → `{token, username, is_owner}`  |
| `GET /me`                      | Current admin                                           |
| `GET /overview`                | Open/closed, cap, counts by status                      |
| `PATCH /config`                | `{registration_open?, registration_cap?}`               |
| `GET /players`                 | `?page&limit&search&registration_status`                |
| `GET /players/export.csv`      | Same filters, every stored field                        |
| `GET /players/{id}`            | Full player record and payment attempts                 |
| `GET /admins`                  | Owner + stored admins                                   |
| `POST /admins`                 | `{username, password}` (password ≥ 8 chars)             |
| `DELETE /admins/{username}`    | Remove a stored admin                                   |

The older `/api/admin/*` routes used by `apps/frontend`'s built-in `/admin` page are unchanged.

## Behaviour to know

- **Closing the form** stops new registrations (`POST /api/register` returns 403). Players who
  already registered can still pay through their resume link.
- **The cap** counts every saved registration, paid or not, same as the check in
  `POST /api/register`.
