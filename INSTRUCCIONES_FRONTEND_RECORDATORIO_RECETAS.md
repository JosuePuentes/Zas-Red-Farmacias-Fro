# Recordatorios y Recetas — Instrucciones para el frontend

Este documento replica las instrucciones del backend (`backend/INSTRUCCIONES_FRONTEND_RECORDATORIO_RECETAS.md`) para que la IA del frontend las tenga en cuenta. Endpoints, métodos y cuerpos deben coincidir con el backend real.

---

## 1. Recordatorios

### Endpoints

- **Listar recordatorios del cliente**  
  `GET /api/cliente/recordatorios`  
  Respuesta: array de recordatorios (id, medicamento, próxima fecha, precio de referencia, etc.).

- **Crear recordatorio**  
  `POST /api/cliente/recordatorios`  
  Body: `{ "codigo": string, "descripcion": string, "imagen"?: string, "precioReferencia"?: number }`  
  (codigo/descripcion/imagen pueden venir del catálogo al agregar desde el buscador del módulo de recordatorios).

### UI

- Mostrar **lista** de recordatorios.
- Mostrar **cuenta regresiva** hasta la próxima toma/compra según la lógica del backend.
- Mostrar **precio de referencia** cuando exista (precioReferencia).
- En el módulo de recordatorios: **buscador** que permita buscar en el catálogo; al elegir un producto, llamar a `POST /api/cliente/recordatorios` con codigo, descripcion, imagen y precioReferencia (según lo que devuelva el catálogo).

---

## 2. Recetas

### Endpoints

- **Buscar por texto (incluye texto salido del OCR)**  
  `GET /api/cliente/recetas/buscar?q=<texto>`  
  El backend solo recibe el texto; **el OCR de la receta es responsabilidad del frontend** (escáner/cámara → texto → este query).

- **Agregar al carrito desde receta**  
  `POST /api/cliente/recetas/agregar-al-carrito`  
  Body: según backend (p. ej. `{ "productoId": string, "cantidad": number }` o `{ "codigo": string, "cantidad": number }`).  
  Tras elegir producto y cantidad en la UI, se llama a este endpoint.

### Flujo en el frontend

1. Usuario introduce **texto de búsqueda** (manual o texto obtenido por OCR de la receta).
2. Llamar `GET /api/cliente/recetas/buscar?q=<texto>`.
3. Mostrar **coincidencias y ofertas** devueltas por el backend.
4. Usuario **elige producto y cantidad**.
5. Llamar `POST /api/cliente/recetas/agregar-al-carrito` con los datos elegidos.

### OCR

- El **OCR de la receta es responsabilidad del frontend** (ej. librería o servicio en el cliente).
- El backend solo recibe el **texto** vía `GET /api/cliente/recetas/buscar?q=...`.

---

## 3. Resumen rápido

| Acción                         | Método | URL                                      | Body / Query                    |
|--------------------------------|--------|------------------------------------------|----------------------------------|
| Listar recordatorios           | GET    | `/api/cliente/recordatorios`             | —                                |
| Crear recordatorio             | POST   | `/api/cliente/recordatorios`             | codigo, descripcion, imagen?, precioReferencia? |
| Buscar recetas (texto / OCR)   | GET    | `/api/cliente/recetas/buscar?q=`         | q (query)                        |
| Agregar a carrito desde receta | POST   | `/api/cliente/recetas/agregar-al-carrito`| productoId/codigo, cantidad      |

- Siempre enviar `Authorization: Bearer <token>` en las peticiones autenticadas.
