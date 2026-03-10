# Instrucciones para la IA del backend — Zas Red Farmacias

Este documento describe lo que el **frontend ya implementa** y qué debe exponer o ajustar el **backend** para que todo funcione junto.

---

## 1. Inventario farmacia (Excel + conflictos de descripción)

### Carga de Excel

- **Endpoint:** `POST /api/farmacias/:farmacia_id/inventario/cargar-excel`
- **Body:** `multipart/form-data` con el archivo (campo `file`).
- **Lógica backend:**
  - Por cada fila del Excel, tomar el **código de barras** y buscar en **catalogo_maestro** por `ean_13`.
  - Si hay **match:** guardar en el producto de la farmacia: `imagen` y `descripcion` y `marca` del sistema; además guardar la descripción del Excel en `descripcionPersonalizada`.
  - Si la descripción del Excel es **distinta** a la del catálogo, incluir esa fila en `conflictosDescripcion` en la respuesta.

### Respuesta del upload

- **Campos:** `creados`, `actualizados`, `vinculadosCatalogo`, `conflictosDescripcion`.
- **conflictosDescripcion:** array de objetos `{ codigo, descripcionSistema, descripcionArchivo }` para que el frontend pregunte al usuario qué descripción usar.

### Resolver descripciones

- **Endpoint:** `POST /api/farmacia/inventario/resolver-descripciones`  
  (farmacia identificada por token o cabecera `X-Farmacia-Id`, no por path.)
- **Body:** `{ decisiones: [ { codigo, usar: 'catalogo' | 'farmacia' } ] }`
- Por cada `codigo`, actualizar el producto de la farmacia para usar la descripción del sistema (`catalogo`) o la del archivo (`farmacia`).

### Modelo Producto (farmacia)

- Campos sugeridos: `descripcionCatalogo`, `descripcionPersonalizada`, `usarDescripcionCatalogo` (boolean).
- La descripción que se muestra es la del sistema o la personalizada según `usarDescripcionCatalogo`.

---

## 2. Catálogo cliente (mejor precio + varios comercios)

- **Endpoint:** `GET /api/cliente/catalogo`
- **Query params:** `q`, `farmacia_id`, `page`, `page_size`, y opcionalmente **`lat`, `lng`** (ubicación del cliente tras "Confirmar ubicación").

Comportamiento esperado:

- Devolver **todas las ofertas** de productos (mismo producto puede aparecer varias veces, una por comercio/farmacia con su `precio`, `existencia`, `farmaciaId`). El frontend agrupa por `codigo`+`descripcion` y muestra el de **mejor precio**; el resto se muestra en "Otros comercios".
- Si se envían `lat` y `lng`, el backend puede **ordenar o filtrar** para priorizar comercios más cercanos al cliente (para que el delivery no se dispare).
- Cada ítem: `id`, `codigo`, `descripcion`, `principioActivo`, `presentacion`, `marca`, `precio`, `descuentoPorcentaje`, `precioConPorcentaje`, `imagen`, `categoria`, `farmaciaId`, `existencia`, `disponible`.

---

## 3. Estimación del costo de delivery

- **Endpoint:** `GET /api/cliente/delivery/estimado?lat=...&lng=...`
- **Respuesta:** `{ costo: number, message?: string }`
- El frontend llama a este endpoint:
  - Tras "Confirmar ubicación" (cuando el usuario confirma su ubicación).
  - Cuando cambia el carrito (para recalcular el costo si hay productos de varios comercios).
- El backend puede calcular el costo en función de:
  - Distancia entre ubicación del cliente y los comercios que tienen ítems en el carrito.
  - Número de comercios (varios comercios pueden implicar más costo de envío).
- Regla de negocio sugerida: evitar que el costo del delivery supere el monto de los productos; el backend puede devolver un tope o un mensaje en `message` si aplica.

---

## 4. Carrito y checkout

- El frontend ya usa:
  - `POST /api/carrito/agregar` con `{ cliente_id, producto_id, cantidad }`
  - Respuesta `status: 'conflicto_farmacia'` para mostrar alerta y opción de cambiar farmacia.
  - `POST /api/carrito/cambiar-farmacia` con `{ cliente_id, farmacia_id }`
  - `POST /api/carrito/confirmar?cliente_id=...`
- Asegurar que el backend acepte y persista estos flujos; si el checkout debe recibir dirección de entrega o comprobante, documentar el body esperado para que el frontend lo envíe en una siguiente iteración.

---

## 5. Auth

- Login único: `POST /api/auth/login` con `{ email, password }`; respuesta con `token` y `user`.
- Token en cabecera: `Authorization: Bearer <token>` en las peticiones autenticadas.
- Recuperación de contraseña: `POST /api/auth/recuperar` (email) y `POST /api/auth/restablecer` (token, nueva_password) según lo ya documentado para el frontend.

---

## Resumen para la IA del backend

1. **Inventario:** Upload Excel con match por código de barras; respuesta con `creados`, `actualizados`, `vinculadosCatalogo`, `conflictosDescripcion`. Resolver con `POST /api/farmacia/inventario/resolver-descripciones` y body `{ decisiones }`. Modelo Producto con `descripcionCatalogo`, `descripcionPersonalizada`, `usarDescripcionCatalogo`.
2. **Catálogo:** `GET /api/cliente/catalogo` con `q`, `page`, `page_size`, `lat`, `lng`; devolver ofertas por producto/comercio para que el frontend muestre mejor precio y "Otros comercios".
3. **Delivery:** `GET /api/cliente/delivery/estimado?lat=&lng=` que devuelva `{ costo }` según ubicación y (opcionalmente) ítems del carrito; tener en cuenta múltiples comercios para no disparar el costo.
4. **Carrito y checkout:** Mantener endpoints actuales; documentar si se requiere body adicional en confirmar (dirección, comprobante, etc.).
5. **Auth:** Login único, token Bearer, y flujo de recuperación/restablecer contraseña.
