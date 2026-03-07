# Instrucciones para el frontend: Master y elección de portal

El backend ya permite que el usuario **master** entre a cualquier portal (Cliente, Delivery, Farmacia, Admin) con el mismo login y **sin pagar suscripciones**. El frontend debe implementar la elección de portal tras el login cuando el usuario sea master.

---

## 1. Flujo de login cuando el usuario es master

1. El usuario escribe email y contraseña y pulsa **Entrar**.
2. Se llama **POST /api/auth/login** como hasta ahora.
3. En la respuesta, si **`user.role === 'master'`**:
   - **No** redirigir automáticamente al panel de admin.
   - Mostrar una **pantalla o modal** con el mensaje tipo: **"¿A qué portal quieres entrar?"** y cuatro opciones:
     - **Portal Cliente**
     - **Portal Delivery**
     - **Portal Farmacia**
     - **Portal Admin (Master)**
4. El usuario elige una opción y el frontend:
   - Guarda en estado (o en sessionStorage) la **elección actual** (ej.: `portalElegido: 'cliente' | 'delivery' | 'farmacia' | 'admin'`).
   - Redirige o muestra la SPA correspondiente a ese portal (mismas rutas/vistas que ya existen para cliente, delivery, farmacia y admin).
5. El **mismo token** de login se usa para todas las peticiones; el backend ya acepta que un usuario con rol `master` acceda a las rutas de `/api/cliente/*`, `/api/delivery/*`, `/api/farmacia/*` y `/api/master/*`.

---

## 2. Cómo debe enviar el frontend las peticiones cuando master "entra como" otro rol

Cuando el usuario es **master** y ha elegido un portal que no es Admin, el backend necesita saber **"como quién"** está actuando en los siguientes casos:

### Portal Farmacia (master entra como farmacia)

- El backend espera que se indique **qué farmacia** se está usando.
- **Obligatorio:** en **todas** las peticiones a **`/api/farmacia/*`** cuando el usuario sea master, el frontend debe enviar:
  - **Cabecera:** `X-Farmacia-Id: <id de la farmacia>`  
  - **O** query: `?farmaciaId=<id de la farmacia>`  
  donde `<id>` es el `_id` de la farmacia elegida.
- Para obtener la lista de farmacias entre las que puede elegir el master:
  - **GET /api/master/farmacias** (con el token de master).
  - Respuesta: array de objetos con `_id`, `nombreFarmacia`, `rif`, `estado`, `direccion`, `telefono`, `planProActivo`, etc.
- **Flujo recomendado:** al elegir "Portal Farmacia", mostrar un **desplegable (dropdown)** con las farmacias devueltas por **GET /api/master/farmacias**. Al seleccionar una, guardar su `_id` y enviarlo en **todas** las peticiones a `/api/farmacia/*` (cabecera `X-Farmacia-Id` o query `farmaciaId`).

### Portal Cliente (master entra como cliente)

- **Opcional:** si quieres que el master vea los datos de **un cliente concreto** (carrito, pedidos, etc.), en las peticiones a **`/api/cliente/*`** envía:
  - **Cabecera:** `X-Cliente-Id: <id del usuario cliente>`  
  - **O** query: `?clienteId=<id>`  
  donde `<id>` es el `_id` del User con rol `cliente`.
- Si **no** se envía `X-Cliente-Id` / `clienteId`, el backend usa el propio usuario master como "cliente"; en ese caso el master verá un portal cliente "vacío" (sin carrito ni pedidos de otro usuario). Para listar usuarios cliente y elegir uno, puedes usar **GET /api/master/usuarios** y filtrar por `role === 'cliente'`.

### Portal Delivery (master entra como delivery)

- **Opcional:** si quieres que el master vea los datos de **un delivery concreto** (pedidos asignados, estadísticas, etc.), en las peticiones a **`/api/delivery/*`** envía:
  - **Cabecera:** `X-Delivery-Id: <id del usuario delivery>`  
  - **O** query: `?deliveryId=<id>`  
  donde `<id>` es el `_id` del User con rol `delivery`.
- Si **no** se envía, el backend usa el propio usuario master como "delivery" (datos vacíos o sin asignaciones). Para listar usuarios delivery puedes usar **GET /api/master/usuarios** y filtrar por `role === 'delivery'`.

---

## 3. Resumen de cabeceras / query por portal (usuario master)

| Portal elegido | Cabecera / query | Obligatorio | Cómo obtener la lista |
|----------------|------------------|-------------|------------------------|
| **Farmacia**   | `X-Farmacia-Id` o `?farmaciaId=` | **Sí** (para ver datos de una farmacia) | **GET /api/master/farmacias** |
| **Cliente**    | `X-Cliente-Id` o `?clienteId=`   | No (si no se envía, se usa el master → vista "vacía") | **GET /api/master/usuarios** y filtrar `role === 'cliente'` |
| **Delivery**   | `X-Delivery-Id` o `?deliveryId=`  | No (si no se envía, se usa el master → vista "vacía") | **GET /api/master/usuarios** y filtrar `role === 'delivery'` |
| **Admin**      | Ninguna                          | —           | — |

---

## 4. Suscripciones / Plan Pro

- Cuando el usuario es **master**, el backend **no** le exige suscripción ni Plan Pro para acceder a las funcionalidades.
- En concreto:
  - **GET /api/farmacia/plan-pro/estado**: si el usuario es master y no envía farmacia (o no hay farmacia asignada), la respuesta es `{ activo: true }`. Si master envía `X-Farmacia-Id`, se devuelve el estado de esa farmacia (y master sigue teniendo acceso total).

---

## 5. Resumen para tu IA de frontend

- Tras **login**, si **`user.role === 'master'`**, mostrar **"¿A qué portal quieres entrar?"** con las 4 opciones (Cliente, Delivery, Farmacia, Admin) y guardar la elección.
- Usar **el mismo token** para todas las rutas; no hace falta otro login.
- **Portal Farmacia (master):** llamar **GET /api/master/farmacias**, mostrar dropdown de farmacias y enviar **`X-Farmacia-Id`** (o `farmaciaId`) en **todas** las peticiones a `/api/farmacia/*`.
- **Portal Cliente/Delivery (master):** opcionalmente enviar **`X-Cliente-Id`** / **`X-Delivery-Id`** (o query) para "ver como" ese usuario; si no, se muestra la vista con el propio master (datos vacíos).
- Master **no** debe verse bloqueado por suscripciones ni Plan Pro en ningún portal.
