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
- **`ADMIN_JWT_SECRET` is required on the backend** (32+ random characters, e.g.
  `openssl rand -hex 32`). Until it's set, the panel's sign-in returns 503 and nothing else in the
  backend is affected.
- Sign-in returns a token valid for 12 hours, signed with `ADMIN_JWT_SECRET`. Changing the secret
  signs everyone out. A token also stops working when its owner's password changes
  (`ADMIN_USERNAME` / `ADMIN_PASSWORD` for the owner) or its admin is removed.
- Sign-in is rate limited: 10 attempts per username and 50 per IP in any 15 minutes (then 429),
  counted in each backend process's memory. If the backend runs behind a proxy, start uvicorn with
  `FORWARDED_ALLOW_IPS` set to the proxy so the limit sees real client IPs.
- Passwords for added admins can be at most 72 bytes (a bcrypt limit).

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
