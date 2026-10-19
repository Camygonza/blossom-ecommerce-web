# Bloom Web

Frontend de Bloom, una tienda en línea de plantas, flores y guías digitales. Está hecho con React 19, TypeScript, Redux Toolkit con RTK Query (sobre axios), MUI 9, React Router 7, React Hook Form con Zod y Vite.

Usa la API del repo [blossom-ecommerce-api](https://github.com/Camygonza/blossom-ecommerce-api); los tipos de `src/api/types.ts` siguen su contrato (`docs/openapi.json` de ese repo).

Hay una versión desplegada en https://bloom-web-ah8o.onrender.com. Como corre en el plan gratuito de Render, la primera visita tarda cerca de un minuto en responder.

## Cómo correrlo

Con Docker, desde el repo de la API (los dos clonados en la misma carpeta):

```bash
cp env.ejemplo .env
docker compose up --build
```

La tienda queda en http://localhost:3000. nginx sirve la aplicación y reenvía `/api` a la API, así que todo está bajo el mismo origen y no hay CORS. En Render la imagen lee `API_UPSTREAM` y `API_HOST` para saber a dónde reenviar; por defecto apuntan al servicio `api` de compose.

Para desarrollar:

```bash
npm install
npm run dev
```

Abre http://localhost:5173 y reenvía `/api` a http://localhost:8080, por lo que necesita la API en marcha. Los usuarios de ejemplo son `cliente@bloom.test` / `Cliente123!` y `admin@bloom.test` / `Admin123!`.

## Qué tiene

- **Cuentas.** Registro e inicio de sesión con validación (la misma regla de contraseña que la API). El access token vive solo en memoria y el refresh en `localStorage`, así que la sesión se restaura al recargar. Si una petición devuelve 401, se renueva el token con una sola petición compartida.
- **Catálogo.** Búsqueda por nombre, categoría y rango de precio, con orden y paginación. Los filtros quedan en la URL, de modo que se pueden compartir y el botón atrás funciona. El detalle cubre productos físicos y digitales.
- **Carrito.** Se guarda en `localStorage`, respeta el stock y permite una sola licencia por guía digital. Para pagar hay que iniciar sesión y luego se vuelve al carrito.
- **Órdenes.** Historial paginado, detalle con el avance del pedido y cancelación de las que siguen pendientes.
- **Administración.** Alta, edición (con control de versión) y baja de productos, y listado de órdenes con filtro por estado y cambio de estado según las transiciones válidas.
- **Presentación.** Precios en pesos colombianos, interfaz en español o inglés con un botón en la cabecera, fotos reales de producto (con una ilustración si una foto no carga), modo claro y oscuro, estados de carga y de vacío, y diseño adaptable a móvil.

Código: `src/api` (axios, sesión, RTK Query), `src/app` (store, rutas, tema), `src/features/{auth,products,cart,orders,admin,home}`, `src/components` y `src/i18n`.

## Tests

```bash
npm test                # Vitest, Testing Library y MSW: 165 tests, cobertura cercana al 95 %
npm run test:coverage
npm run lint && npm run build
```

Las pruebas de componentes incluyen axe-core para accesibilidad y montan la aplicación completa con la red simulada con MSW.

Los E2E con Playwright cubren el flujo del cliente (registro, búsqueda, carrito, orden, historial y cancelación), el del administrador y el contraste en Chrome real, en modo claro y oscuro, en escritorio y móvil, y también el cambio de idioma.

```bash
PW_BASE_URL=http://localhost:3000 npm run e2e   # contra docker compose
npm run e2e                                     # contra Vite y una API local con LOGIN_RATE_LIMIT_MAX=1000
```

`npm run e2e:demo` graba el recorrido completo en video. Usa el Chrome instalado; con `PW_CHANNEL=chromium` usa el de Playwright. Con `E2E_SHOTS=<carpeta>` se guardan capturas de cada paso.

## Decisiones

Están explicadas, con las alternativas que descarté, en [docs/decisiones.md](docs/decisiones.md). Las más importantes:

- RTK Query sobre un `baseQuery` de axios: da caché, invalidación por etiquetas (comprar o cancelar refresca el catálogo porque cambia el stock) y estados de carga sin escribir thunks.
- Access token en memoria y refresh en `localStorage`. Un XSS podría leer el refresh; lo reduzco con una CSP estricta en nginx y sin `dangerouslySetInnerHTML`.
- El precio del carrito es solo de referencia: la API congela el real al crear la orden.
- El idioma se resuelve con un diccionario propio (el texto en español es la clave) en lugar de una librería; una prueba falla si falta alguna traducción. La moneda no cambia con el idioma.
- La accesibilidad se verifica con axe, tanto en los tests como en el navegador, y los chips de estado usan colores con contraste de al menos 4,5:1 en ambos modos.

## Dificultades

- Si el store se creaba dentro de un hook, en StrictMode el listener de sesión quedaba atado a otro store y el login no se reflejaba. Ahora el store y el router se crean una sola vez en `main.tsx`.
- Con refresh tokens rotativos, dos renovaciones a la vez revocarían la sesión. La renovación se hace con una única petición compartida.
- jsdom no mide el contraste. Axe en Chrome real encontró fallas en los chips de estado y las corregí con colores distintos por modo.
- La CSP de nginx bloquea scripts en línea, que axe necesita; solo se desactiva dentro de esa prueba.
- Con el cambio de idioma, los nombres y descripciones de producto vienen de la API en español. Los del seed los traduzco en el front; los que cree un administrador se muestran tal como se escribieron.

## Con más tiempo

- Pago real y descarga autorizada de los productos digitales.
- Sugerencias en la búsqueda, filtro por varias categorías e imágenes en varios tamaños (`srcset`).
- Generar los tipos desde `docs/openapi.json` (hoy los mantengo a mano) y agregar pruebas visuales de regresión.
- Traducir productos desde la API con `Accept-Language`, y agregar favoritos y reseñas.
