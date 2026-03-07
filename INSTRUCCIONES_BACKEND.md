# Instrucciones para el Backend — Zas (GPS, ubicaciones, pedidos y delivery)

Este documento describe lo que el frontend ya envía o espera del backend para ubicación, registro, pedidos, delivery y factura.

---

## 1. Al abrir la app — Ubicación (GPS)

- El frontend solicita permiso de ubicación en la página de inicio (opcional: "Activar ubicación" / "Más tarde").
- No se envía nada al backend por solo activar GPS; se usa en registro, checkout y seguimiento.

---

## 2. Registro de cliente

**Endpoint:** `POST /api/auth/register/cliente`

**Body actual (ampliado):**

```json
{
  "cedula": "V-12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "direccion": "Av. Principal 123",
  "telefono": "04121234567",
  "email": "juan@correo.com",
  "password": "***",
  "estado": "Miranda",
  "municipio": "Guatire",
  "lat": 10.12345,
  "lng": -66.54321
}
```

- **estado** y **municipio**: obligatorios en el formulario; el backend debe guardarlos en el modelo de Usuario (cliente).
- **lat** y **lng**: opcionales; se envían cuando el usuario pulsa "Usar mi ubicación (GPS)". Guardarlos en el usuario para referencia (ej. farmacias cercanas, estadísticas por zona).

**Sugerencia en BD:**  
Campos en colección/tabla de usuarios (cliente): `estado`, `municipio`, `lat`, `lng` (todos opcionales salvo estado/municipio si así lo definen).

---

## 3. Farmacias — Direcciones guardadas

- Cada farmacia debe tener **dirección física** y, si es posible, **coordenadas** (`lat`, `lng`) guardadas.
- Cuando un pedido se asigna a un delivery, el backend debe incluir:
  - **Dirección de la farmacia** (donde recoger el pedido).
  - **Dirección y coordenadas del cliente** (donde entregar).

Así el delivery sabe automáticamente dónde recoger y dónde entregar al aceptar el pedido.

**Sugerencia en BD (farmacia):**  
`direccion`, `estado`, `municipio`, `lat`, `lng` (opcionales pero recomendados).

---

## 4. Crear pedido (checkout)

El frontend enviará (cuando el backend lo soporte) algo como:

**Endpoint sugerido:** `POST /api/cliente/pedidos` (o el que usen para crear pedido)

**Body sugerido:**

```json
{
  "items": [ { "productoId": "...", "cantidad": 2, "precioUnitario": 2.5 } ],
  "metodoPago": "pago_movil",
  "comprobante": "<base64 o multipart>",
  "direccionEntrega": "Av. Principal, edificio 5, apto 3",
  "latEntrega": 10.4806,
  "lngEntrega": -66.9036
}
```

- **direccionEntrega**: texto que el cliente puede editar en checkout.
- **latEntrega** y **lngEntrega**: obligatorios para el flujo actual; se obtienen del mapa en checkout (clic o GPS).

El backend debe guardar en el pedido: `direccionEntrega`, `latEntrega`, `lngEntrega`, para que el delivery y el mapa de seguimiento los usen.

---

## 5. Delivery — GPS activo y pedidos

- El delivery debe tener **GPS activo** para recibir ofertas de pedidos (el frontend ya muestra el mensaje; el backend puede validar que la app envíe posición al estar "activo").
- Endpoint sugerido para listar pedidos asignados al delivery:  
  `GET /api/delivery/pedidos`  
  Respuesta por pedido debe incluir:
  - Datos del cliente: nombre, cédula, dirección de entrega.
  - Dirección de la farmacia (recogida).
  - Items, precios, total (para la factura).
  - Estado del pedido.

- Para **imprimir factura**, el frontend usa esos mismos datos (nombre Zas, logo, cliente, cédula, dirección, productos con precio unidad, cantidad, total, total factura). No se requiere un endpoint extra de factura si el pedido ya trae todo.

---

## 6. Posición del delivery en tiempo real y ETA

- El **cliente** en "Mis pedidos" ve un mapa con:
  - Ubicación de entrega (destino).
  - Ubicación actual del delivery (en tiempo real).
  - ETA: minutos aproximados y/o hora estimada de llegada.

**Backend debe:**

1. **Recibir la posición del delivery** periódicamente (ej. cada 10–30 s) mientras esté activo o tenga un pedido "en camino":
   - `PATCH /api/delivery/posicion` o `PUT /api/delivery/pedidos/:id/posicion`  
   - Body: `{ "lat": 10.48, "lng": -66.90 }` (y opcionalmente `pedidoId` si aplica).

2. **Exponer para el cliente** la posición actual del delivery y, si lo calculan, el ETA:
   - Opción A: `GET /api/cliente/pedidos/:id/seguimiento`  
     Respuesta: `{ "deliveryLat": 10.48, "deliveryLng": -66.90, "etaMinutos": 8, "etaHoraLlegada": "14:35" }`.
   - Opción B: WebSocket o SSE para actualizar en tiempo real (lat/lng y ETA).

El frontend ya está preparado para mostrar `deliveryLat`, `deliveryLng`, `etaMinutos`, `etaHoraLlegada` en el mapa de "Mis pedidos".

---

## 7. Mapa de Venezuela

- El frontend usa un mapa centrado en Venezuela (Leaflet + OpenStreetMap). No es necesario que el backend sirva mapas.
- Para uso "offline" o mapa descargado: el frontend puede usar tiles cacheadas o una PWA; el backend no tiene que cambiar nada por esto.

---

## 8. Resumen de datos a guardar

| Dónde        | Campos de ubicación / entrega |
|-------------|-------------------------------|
| Usuario (cliente) | `estado`, `municipio`, `lat`, `lng` |
| Farmacia    | `direccion`, `estado`, `municipio`, `lat`, `lng` |
| Pedido      | `direccionEntrega`, `latEntrega`, `lngEntrega`; items con precio unitario, cantidad, total |
| Delivery (sesión/pedido) | Posición actual: `lat`, `lng`; ETA: `etaMinutos`, `etaHoraLlegada` (opcional, calculado en backend) |

---

## 9. Factura (ticket)

- La factura se genera en el **frontend** (módulo delivery) con los datos del pedido: nombre Zas, logo, datos del cliente, cédula, dirección de entrega, productos (descripción, precio unidad, cantidad, total), total general.
- El backend solo debe devolver en el pedido la información necesaria (cliente, items con precios, total); no es obligatorio un endpoint específico de "factura" si el pedido ya incluye todo lo anterior.

Si necesitas un PDF de factura desde el backend, puede ser un endpoint adicional; el frontend por ahora imprime la vista tipo ticket con `window.print()`.

---

## 10. Plan Pro (módulo farmacia — suscripción)

### 10.1 Descripción

- Las farmacias pueden contratar el **Plan Pro** por **$ 4,99/mes**.
- Sin suscripción activa, al hacer clic en "Plan Pro" se abre un modal con el explicativo de beneficios y el botón "Comprar plan". Al pagar, la farmacia envía: **nombre del banco emisor**, **número de referencia** y **comprobante** (imagen/PDF). La suscripción **no se activa automáticamente**: el master debe aprobar la solicitud desde el módulo **Solicitudes Plan Pro**. Una vez aprobada, esa farmacia tiene acceso total al módulo (lista comparativa, carrito, órdenes de compra, proveedores, alertas).

### 10.2 Endpoints farmacia

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/farmacia/plan-pro/estado` | Devuelve `{ activo: boolean, farmaciaId?: string }`. El usuario debe estar autenticado como farmacia. `activo: true` solo si el master aprobó su solicitud. |
| POST | `/api/farmacia/plan-pro/solicitud` | Body: `{ bancoEmisor: string, numeroReferencia: string, comprobanteBase64?: string }`. Crea una solicitud de suscripción Plan Pro (estado `pendiente`). Opcional: aceptar multipart/file para el comprobante en lugar de base64. |

### 10.3 Endpoints master

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/master/solicitudes-plan-pro` | Lista todas las solicitudes Plan Pro (o solo `estado: 'pendiente'`). Cada ítem: `_id`, `farmaciaId`, `nombreFarmacia`, `email`, `bancoEmisor`, `numeroReferencia`, `comprobanteUrl`, `estado`, `createdAt`. |
| POST | `/api/master/solicitudes-plan-pro/:id/aprobar` | Aprueba la solicitud: marcar estado `aprobado` y activar Plan Pro para esa farmacia (ej. guardar en farmacia o usuario `planProActivo: true`). A partir de ahí, `GET /api/farmacia/plan-pro/estado` debe devolver `activo: true` para esa farmacia. |
| POST | `/api/master/solicitudes-plan-pro/:id/denegar` | Marca la solicitud como `denegado`. |

### 10.4 Modelo sugerido

- **SolicitudPlanPro**: `_id`, `farmaciaId` (ref Farmacia), `bancoEmisor`, `numeroReferencia`, `comprobanteUrl` (o almacenar archivo en storage), `estado` (`pendiente` | `aprobado` | `denegado`), `createdAt`.
- **Farmacia** (o usuario farmacia): campo `planProActivo: boolean` (por defecto `false`). Poner `true` al aprobar una solicitud.

### 10.5 Módulo Plan Pro — datos (futuro)

El frontend ya incluye:

- **Lista comparativa**: búsqueda en tiempo real; tabla con código, descripción, marca, categoría (tipo de medicamento), precio, existencia, cantidad a pedir, agregar al carrito. Filas con "prioridad" (inventario bajo / alta demanda) resaltadas.
- **Carrito**: ítems agregados desde la lista; agrupación por proveedor al "Generar órdenes de compra".
- **Órdenes de compra**: agrupadas por proveedor; exportar Excel/PDF (el frontend puede generar CSV/print; el backend puede ofrecer endpoints para Excel/PDF con logo y formato).
- **Proveedores**: listado con "total comprado" por proveedor (para sugerencias y comparativos).

Para que todo funcione con datos reales, el backend deberá ofrecer (en una segunda fase, si lo desean):

- CRUD de **proveedores** (por farmacia): nombre, condiciones, etc.
- Carga de **listas de precios** por proveedor (archivo Excel/CSV o ítems manuales): código, descripción, marca, precio, existencia; el backend puede asignar **categoría** (antialérgico, antibiótico, etc.) por principio activo o nombre (tabla o reglas).
- **Historial de órdenes de compra** por farmacia y por proveedor; total comprado por proveedor.
- **Alertas**: análisis de inventario (pocos ítems de una categoría) y de demanda (pedidos masivos de un tipo); notificaciones que el frontend muestra en la campanita y que marcan productos como "prioridad" en la lista comparativa.
- **Alertas de precio**: guardar último precio de compra por producto/farmacia y notificar cuando en una lista nueva el precio baje.
