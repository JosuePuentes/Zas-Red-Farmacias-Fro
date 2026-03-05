# Zas! Frontend - Farmacias

App tipo PWA para comercio de medicamentos farmacéuticos. Diseño mobile-first.

## Estructura de portales

- **Home**: Iniciar sesión (único botón), registro cliente, enlace registro delivery.
- **Login**: Un solo formulario (correo + clave). El backend devuelve el tipo de usuario y se redirige al panel correspondiente.
- **Admin (usuario maestro)**: Pedidos de todas las farmacias, registro de farmacias (gerente, RIF, nombre, dirección, teléfono, **porcentaje**, email, clave), solicitudes de repartidores (aprobar/denegar, asignar contraseña).
- **Cliente**: Registro (cédula, nombre, apellido, dirección, correo, contraseña). Área cliente: catálogo (filtro por estado, búsqueda, productos con foto izq + descripción + precio, agregar carrito), carrito, checkout (total + delivery, método de pago, subir comprobante), mi cuenta. Productos de la misma farmacia marcados con un color; otros con otro color y aviso de delivery más costoso.
- **Farmacia**: Dashboard (total vendido, $, clientes), Pedidos (notificaciones, validar/denegar), Inventario (carga Excel: codigo, descripcion, marca, precio, existencia).
- **Delivery**: Registro (tipo vehículo, cédula, nombres, dirección, teléfono, correo, licencia, foto licencia, carnet circulación, foto carnet). Dashboard: activar para recibir pedidos, pedidos validados con dirección recoger/entregar, precio y tiempo 1 min para aceptar. Estadísticas: ganancias, km.

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Probar distintos tipos de usuario (sin backend)

En la consola del navegador (F12), antes de iniciar sesión:

```js
localStorage.setItem('zas_mock_role', 'admin')   // o 'cliente' | 'farmacia' | 'delivery'
```

Luego inicia sesión con cualquier correo y contraseña; entrarás al panel del rol elegido.

## Backend y contrato API

- **Backend**: [Zas-Red-Farmacias-Back](https://github.com/JosuePuentes/Zas-Red-Farmacias-Back)
- **Contrato frontend**: En el repo del backend está `INSTRUCCIONES_FRONTEND_IA.md` con base URL, proxy, auth (Bearer), login único, tasa BCV y tabla de endpoints. Para que la IA del frontend mantenga el mismo contrato, usa ese archivo como referencia.

Este frontend ya está configurado con proxy Vite:
- `/api` → backend (por defecto `http://localhost:3000`)
- `/uploads` → archivos estáticos del backend

Si el backend corre en otro puerto, crea `.env` con `VITE_API_URL=http://localhost:PUERTO`.

## Sincronizar con el backend

1. En `src/context/AuthContext.tsx`: reemplazar el `login` mock por `POST /api/auth/login` y guardar el usuario (incluido `role`) que devuelva; enviar el token en `Authorization: Bearer <token>` en las peticiones.
2. Crear un cliente API (ej. `src/api/client.ts`) que use `/api` como base (el proxy de Vite lo reenvía al backend).
3. En cada página con comentario `TODO: conectar con backend`, sustituir datos mock por llamadas al API según la tabla de endpoints en `INSTRUCCIONES_FRONTEND_IA.md`.
4. Mostrar tasa BCV (GET `/api/config`) arriba a la derecha en cliente, farmacia y delivery.
5. Los tipos en `src/types/index.ts` se pueden ajustar a los DTOs del backend.

## Build

```bash
npm run build
```

Salida en `dist/`.
