# Copilot Instructions for EvenceEvents

- This is an Angular 21 app using standalone components, server-side rendering support (`@angular/ssr`), and `json-server` as a local mock backend.
- The main route configuration lives in `src/app/app.routes.ts`; all pages are registered there, including `/login`, `/carrinho`, `/eventos`, `/cadastro`, `/new-event`, and `/eventos/:id`.
- Application bootstrapping uses `src/app/app.config.ts` for browser providers and `src/app/app.config.server.ts` for SSR providers.
- API integration is centralized in `src/app/services/services.ts` via `EventosService`.
  - `getEventos()` -> `http://localhost:3000/eventos`
  - `getCategorias()` -> `http://localhost:3000/categorias`
  - `getEventoById(id)` -> `http://localhost:3000/eventos/{id}`
  - `login(email, senha)` -> `http://localhost:3000/usuarios?email={email}&senha={senha}`
  - `cadastro(usuario)` -> `http://localhost:3000/usuarios`
- The app expects the local API to run with `npm run backend` from the project root; the JSON data source is `db.json`.
- Authentication and cart state are stored in browser `localStorage`:
  - logged user saved as `usuarioLogado`
  - cart stored per user key `carrinho_usuario_<userId>`
- Core page patterns:
  - `login.component.ts` uses `ReactiveFormsModule` and simple form validation.
  - `lista-eventos.component.ts` handles client-side filtering, search, sorting, and category selection in the component class.
  - `detalhes.ts` uses route param `id` and redirects unauthenticated users to `/login`.
- Important workflows:
  - `npm start` => `ng serve`
  - `npm run backend` => start mock API (`json-server --watch db.json --port 3000 --cors`)
  - `npm run build` => Angular build
  - `npm test` => run unit tests with `ng test` (Vitest)
  - `npm run serve:ssr:Evence-Events` => serve SSR output after build
- Project conventions:
  - Use `standalone: true` components with explicit `imports` inside `@Component`.
  - Shared UI components live under `src/app/componentes/`; page routes live under `src/app/pages/`.
  - Data interfaces are defined in `src/app/interfaces/`.
  - Most components use Portuguese identifiers and comments, so follow the existing naming style for new code.
- Avoid making assumptions about a real backend: this app currently depends on `json-server` semantics and syncs state through local storage rather than a dedicated store.

> If something is unclear, ask for whether the change should target route wiring, API shape, or local storage/cart semantics first.
