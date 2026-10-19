# Bloom · Web

Frontend del e-commerce **Bloom** (plantas, flores y guías digitales).
React 19 · TypeScript (strict) · Redux Toolkit + RTK Query (axios) · MUI 9 · React Router 7 · React Hook Form + Zod · Vite.

> **Demo en línea:** https://bloom-web-ah8o.onrender.com (plan gratuito: la primera visita puede tardar cerca de un minuto en despertar). Cuentas demo más abajo.

Consume la API del repo hermano [`blossom-ecommerce-api`](https://github.com/Camygonza/blossom-ecommerce-api); los tipos de `src/api/types.ts` siguen su contrato OpenAPI (`docs/openapi.json` de ese repo).

## Cómo correrlo

### Todo con Docker

Desde el repo del api (clonados uno junto al otro): `cp env.ejemplo .env && docker compose up --build` y abre <http://localhost:3000>. nginx sirve la SPA y reenvía `/api` a la API (mismo origen, sin CORS).

### En la nube

El repo del api trae un Blueprint de Render que despliega este web junto a la API y PostgreSQL. La imagen lee `API_UPSTREAM` (URL de la API) y `API_HOST` (su host) para el proxy `/api` de nginx; por defecto apuntan al servicio `api` de docker compose.

### Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173; /api se redirige a http://localhost:8080
```

Necesita la API arriba (ver su README). Usuarios de demostración: `cliente@bloom.test` / `Cliente123!` y `admin@bloom.test` / `Admin123!`.

## Qué incluye

| Área | Detalle |
|---|---|
| Autenticación | Login y registro con validación (RHF + Zod, misma regla de contraseña que el api). Access token **solo en memoria**, refresh en `localStorage`; la sesión se restaura al recargar. Renovación automática ante un 401 con una única petición compartida (el api revoca la familia si se reusa un refresh). |
| Catálogo | Lista con filtros por nombre, categoría y rango de precio, orden y paginación; **los filtros viven en la URL** (se pueden compartir). Detalle de producto físico y digital. |
| Carrito y checkout | Redux persistido en `localStorage`; topes por stock (una licencia por guía digital). El checkout pide login y vuelve al carrito. |
| Órdenes | Historial paginado, detalle con progreso, cancelación de órdenes pendientes. |
| Administración | Panel de productos (alta, edición con control de versión, baja) y de órdenes (filtro y cambio de estado con las transiciones válidas). |
| UX | Modo claro/oscuro, skeletons, estados vacíos ilustrados, toasts, error boundary, rutas con lazy loading, responsive y accesible (WCAG 2.1 AA). |

Estructura: `src/api` (axios, sesión, RTK Query, errores), `src/app` (store, router, tema), `src/features/{auth,products,cart,orders,admin,home,ui}`, `src/components`.

## Tests

```bash
npm test                 # Vitest + React Testing Library + MSW (112 tests, ≈ 94 % de cobertura)
npm run test:coverage    # informe en coverage/
npm run lint && npm run build
```

Las pruebas incluyen **axe-core** (accesibilidad) sobre las páginas principales y montan la app completa con la red simulada con MSW.

### E2E (Playwright)

Flujo de cliente (registro → búsqueda → carrito → orden → historial → cancelación), flujo de administración y **contraste AA en Chrome real**, en modo claro y oscuro, escritorio y móvil (52 pruebas).

```bash
# contra el stack de docker compose (http://localhost:3000)
PW_BASE_URL=http://localhost:3000 npm run e2e
# contra Vite + una API local (arranca la API con LOGIN_RATE_LIMIT_MAX=1000)
npm run e2e
```

`npm run e2e:demo` graba el recorrido completo (registro → compra → administración) en video de 1280×720 con cámara lenta (necesita `npx playwright install ffmpeg` una vez; el video queda en `test-results/`).

Usa el Chrome instalado; con `PW_CHANNEL=chromium` usa el de Playwright (`npx playwright install chromium`). `E2E_SHOTS=<carpeta>` guarda capturas de cada paso.

## Decisiones de diseño

Detalle y alternativas descartadas en [`docs/decisiones.md`](docs/decisiones.md) (D5 y D21 son las del frontend).

- **RTK Query con `baseQuery` sobre axios**: caché, invalidación por tags (comprar o cancelar invalida el catálogo porque cambia el stock) y estados de carga sin escribir thunks.
- **Tokens**: access en memoria y refresh en `localStorage`; trade-off XSS asumido y mitigado con una CSP estricta en nginx.
- **La URL como estado de los filtros**: botón «atrás», enlaces compartibles y sin estado duplicado.
- **El precio del carrito es de referencia**: el api congela el real al crear la orden.
- **Accesibilidad verificada, no supuesta**: axe en las pruebas de componentes y en navegador (con contraste); los chips de estado usan pares de color con contraste ≥ 4,5:1 en ambos modos.

## Retos

- **Un store creado dentro de un hook en StrictMode**: el listener de sesión quedaba atado a otro store y el login no se reflejaba en la UI. Store y router se crean una sola vez en `main.tsx`.
- **Refresh concurrente**: con tokens rotativos, dos refresh simultáneos revocarían la sesión; la renovación es de un solo vuelo.
- **Contraste que jsdom no mide**: se descubrió con axe en Chrome real (chips de estado) y se corrigió con colores por modo.
- **CSP vs herramientas de prueba**: la CSP de nginx bloquea scripts en línea; la prueba de accesibilidad la salta solo en esa prueba.

## Con más tiempo

- Pago real y entrega de productos digitales (enlace de descarga autorizado).
- Búsqueda con sugerencias y filtro por varias categorías; imágenes optimizadas (`srcset`).
- Tipos generados desde `docs/openapi.json` (hoy se mantienen a mano) y pruebas visuales de regresión.
- Internacionalización (hoy solo español) y favoritos/reseñas.
