# Instrucciones para la IA del frontend — Zas Red Farmacias

> **Prompt para pegar al inicio del chat con la IA del frontend:**
>
> Proyecto: Zas Red Farmacias. Backend en Node desplegado en `https://zas-red-farmacias-back.onrender.com`.  
> Sigue SIEMPRE este archivo `INSTRUCCIONES_FRONTEND_IA.md` para la URL de producción, el catálogo, carrito, checkout, inventario y auth. No inventes endpoints; usa solo los documentados aquí.

---

## URL de producción

- **Base API:** `https://zas-red-farmacias-back.onrender.com/api`
- En el frontend (Vite), configurar por ejemplo: `VITE_API_URL=https://zas-red-farmacias-back.onrender.com` (sin `/api` al final; el código suele añadir `/api`).

---

## Catálogo

### GET `/api/cliente/catalogo`

- **Descripción:** Lista el catálogo de productos para el cliente.
- **Query params (opcionales):**
  - `q`: búsqueda por texto (nombre, descripción, código, etc.).
  - `farmacia_id`: si se envía, el backend puede devolver precios y disponibilidad por farmacia.
  - `page`, `page_size`: paginación (ej. `page=0`, `page_size=20`).
- **Formato de respuesta:** Array de productos. Cada ítem puede incluir:
  - `id`, `codigo`, `descripcion`, `principioActivo`, `presentacion`, `marca`, `precio`, `descuentoPorcentaje`, `precioConPorcentaje`, `imagen`, `categoria`, `farmaciaId`, `existencia` (o `disponible`).
- **Imágenes:** Si el backend devuelve `imagen` (URL o path), mostrarla; si no hay imagen, usar placeholder o texto “Sin imagen”.
- **Sin stock:** Si `existencia === 0` o `disponible === false`, mostrar “Sin stock” y no permitir agregar al carrito (o deshabilitar el botón).

### GET `/api/cliente/delivery/estimado`

- **Query params:** `lat`, `lng`. **Respuesta:** `{ costo: number, message?: string }`. Usado en la calculadora de delivery del catálogo.

### GET `/api/cliente/productos`

- **Descripción:** Endpoint alternativo o detalle de productos (según implementación del backend). Misma base URL: `https://zas-red-farmacias-back.onrender.com/api`.
- **Uso:** Consultar documentación o código del backend para query params y formato; en general alinear con el formato de ítems del catálogo anterior (id, descripcion, precio, imagen, existencia, etc.).

---

## Reglas obligatorias para la IA

1. **Login único:** Un solo flujo de login (por ejemplo `POST /api/auth/login`). No inventar otros endpoints de login.
2. **Token:** Tras login, guardar el token (ej. en `localStorage`) y enviarlo en cabecera `Authorization: Bearer <token>` en todas las peticiones autenticadas.
3. **BCV:** Si la app muestra precios en bolívares o tasas, usar solo la fuente/tasa que proporcione el backend (ej. endpoint de tasa BCV si existe); no inventar endpoints de “BCV” no documentados.
4. **Catálogo:** Usar solo `GET /api/cliente/catalogo` (y opcionalmente `GET /api/cliente/productos` si el backend lo expone) con los query params indicados; no inventar rutas de catálogo distintas.
5. **Carrito:** Usar los endpoints acordados (ej. `POST /api/carrito/agregar`, `POST /api/carrito/cambiar-farmacia`, `POST /api/carrito/confirmar` con `cliente_id`). No inventar endpoints de carrito.
6. **Checkout:** Confirmar pedido con el endpoint de confirmación de carrito y, si aplica, datos de entrega/comprobante según lo que el backend acepte; no inventar flujos ni URLs.
7. **Inventario Excel:**  
   - Subir: `POST /api/farmacias/{farmacia_id}/inventario/cargar-excel` (FormData con el archivo).  
   - Respuesta puede incluir: `creados`, `actualizados`, `vinculadosCatalogo`, `conflictosDescripcion`: array de `{ codigo, descripcionSistema, descripcionArchivo }`.  
   - Si `conflictosDescripcion.length > 0`, el frontend muestra para cada uno: "Para el código X: ¿usar descripción del sistema (descripcionSistema) o la de tu archivo (descripcionArchivo)?" y recoge decisiones.  
   - Resolver: `POST /api/farmacia/inventario/resolver-descripciones` (farmacia por token/cabecera). Body: `{ decisiones: [ { codigo, usar: 'catalogo' | 'farmacia' } ] }`. No inventar otros endpoints de inventario.
8. **No inventar endpoints:** Cualquier ruta o parámetro no documentado aquí o en el backend debe evitarse o consultarse antes de implementar.

---

## Resumen para la IA

- **Base URL API:** `https://zas-red-farmacias-back.onrender.com/api`
- **Auth:** Login único, token en `Authorization: Bearer <token>`.
- **Catálogo:** `GET /api/cliente/catalogo` (con opcional `lat`, `lng`); `GET /api/cliente/delivery/estimado` para costo de envío (y si aplica `GET /api/cliente/productos`), con `q`, paginación e imágenes; mostrar “Sin stock” cuando no haya existencia.
- **Carrito y checkout:** Endpoints de carrito y confirmación documentados; no inventar.
- **Inventario farmacia:** Cargar Excel y resolver conflictos de descripción con los endpoints indicados.

---

## Prompt corto para pegar al inicio del chat

```
Proyecto: Zas Red Farmacias. Backend en Node desplegado en https://zas-red-farmacias-back.onrender.com.
Sigue SIEMPRE el archivo INSTRUCCIONES_FRONTEND_IA.md para la URL de producción, catálogo (GET /api/cliente/catalogo y GET /api/cliente/productos), búsqueda con q, imágenes y "Sin stock", carrito, checkout, inventario Excel y auth. No inventes endpoints.
```
