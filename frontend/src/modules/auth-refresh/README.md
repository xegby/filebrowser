# Module: Auth Refresh

Keeps the full user profile in sync whenever the JWT changes or a user logs in.

Why it exists
- The JWT usually carries a minimal snapshot of the user. Some fields (including feature flags and future additions) are only available via the users API.
- Instead of sprinkling profile-fetch logic in auth flows (login/renew) in core code, this module centralizes and isolates it.

How it works
- Watches `[auth.jwt, auth.user?.id]` from the Pinia auth store.
- When both are valid and the tuple changes, it fetches the full user with `users.get(id)` and calls `auth.updateUser(fullUser)`.
- Deduplicates requests per `(jwt:id)` pair and ignores errors to avoid disrupting the auth flow.

Wiring
- Implemented as a side-effect module: `src/modules/auth-refresh/register.ts`.
- Loaded by the modules plugin during app initialization.

Consumers
- Modules that rely on up-to-date user fields (e.g., `readmePreview`) get fresh data via the store without adding logic to core auth utilities.

