# Extension System (Extensions)

This directory implements a lightweight frontend extension system that lets you plug independent modules without changing the core view logic.

Core pieces
- Registry: `src/modules/registry.ts` — maps a mount target to an array of components.
- Mount component: `src/modules/ExtensionsMount.vue` — renders all components registered for a given target.
- Plugin: `src/modules/index.ts` — installed once and imports each module’s `register` file.
- Module registration: each module exposes a `register.ts` that calls `register('<target>', Component)`.

Wiring
- The plugin is installed in `src/main.ts:1` via `app.use(ModulesPlugin)`.
- Mount points currently declared:
  - In file listing view (`src/views/files/FileListing.vue`):
    ```vue
    <ExtensionsMount target="filelisting:after" />
    ```
  - In profile settings, append a new column after existing columns (`src/views/settings/Profile.vue`):
    ```vue
    <ExtensionsMount target="profile:after-columns" />
    ```

Concepts
- Target — a string identifier of a UI location where modules can render. Example: `filelisting:after` (section after the file listing).
- Module — a Vue component plus a `register.ts` that binds it to a target.

Add a new mount point
1) Insert the mount component where needed:
   ```vue
   <ExtensionsMount target="<your-target>" />
   ```
2) That’s it — any modules registered for `<your-target>` will render there.

Create a new module
1) Create a folder `src/modules/<feature>/`.
2) Add a component, e.g. `Component.vue`.
3) Add `register.ts` with a target binding:
   ```ts
   import { register } from '@/modules/registry'
   import Component from './Component.vue'
   register('<your-target>', Component)
   ```
4) Register it centrally by importing the module’s `register.ts` in `src/modules/index.ts`, e.g.:
   ```ts
   import '@/modules/<feature>/register'
   ```

Target naming recommendations
- Use `<view>:<position>` (e.g., `filelisting:before`, `filelisting:after`, `sidebar:footer`).
- Avoid coupling to DOM structure — keep mount points stable.

Upstream compatibility
- Core views (e.g., FileListing) only host extension points — a single `<ExtensionsMount ...>` line. This minimizes diff against upstream and simplifies merges.
