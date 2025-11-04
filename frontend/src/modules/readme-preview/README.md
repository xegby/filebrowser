# Module: README Preview

Renders a preview of `README.md` for the current directory directly below the file listing.

Where it is wired
- Registration: `src/modules/readme-preview/register.ts`
  ```ts
  import { register } from '@/modules/registry'
  import ReadmePreview from './ReadmePreview.vue'
  register('filelisting:after', ReadmePreview)
  // Render settings as a new column appended after existing columns
  register('profile:after-columns', ProfileForm)
  ```
- Mount point in the file listing view: `src/views/files/FileListing.vue`
  ```vue
  <ExtensionsMount target="filelisting:after" />
  ```
- Mount point in the profile view (after all settings columns): `src/views/settings/Profile.vue`
  ```vue
  <ExtensionsMount target="profile:after-columns" />
  ```

How it works
- Renders only when the user setting `readmePreview` is enabled (see profile).
- On every directory navigation:
  - Locates `README.md` in `fileStore.req.items`;
  - Fetches its content via `api.fetch(item.url)`;
  - Converts Markdown with `marked` and sanitizes HTML with `DOMPurify`;
  - Displays the result inside the `md_preview` block.
- Guards against request races using a local `readmeRequestId`.

Module files
- Component: `src/modules/readme-preview/ReadmePreview.vue` — loading/render logic and reactions to list/setting changes.
- Settings form: `src/modules/readme-preview/ProfileForm.vue` — renders as its own `.column` (standalone card) appended to the profile settings row.
- Registration: `src/modules/readme-preview/register.ts` — binds the module to both targets.

Requirements and dependencies
- User flag `readmePreview`.
- API availability `files.fetch(url)` returning `{ content }`.
- Runtime deps: `marked`, `dompurify`.
 - Depends on `auth-refresh` module to keep the full user profile in sync after JWT changes (so `auth.user.readmePreview` stays up to date without scattering logic in core).
