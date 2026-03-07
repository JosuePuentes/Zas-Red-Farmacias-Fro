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
