# Instrucciones: imágenes del catálogo (frontend)

## Variable de entorno

- **Base del backend** (sin `/api`): `VITE_API_URL`  
  Ejemplo: `VITE_API_URL=https://zas-red-farmacias-back.onrender.com`

## URL de la imagen de producto

Si el ítem trae `imagen` (ej. `"public/productos/7591127123626.jpg"`) y **no** empieza por `http`:

```ts
imagenUrl = base + "/" + imagen.replace(/^\/+/, '')
```

Ejemplo:  
`https://zas-red-farmacias-back.onrender.com/public/productos/7591127123626.jpg`

- Si `imagen` es **null** o vacío → no mostrar imagen o usar **placeholder**.

## Uso en código

El frontend centraliza esta lógica en `src/api/index.ts`:

- **`getBackendBaseUrl()`** — devuelve la base del backend sin `/api` (usa `VITE_API_URL` o `window.location.origin` en dev).
- **`buildProductImageUrl(imagen)`** — recibe `imagen` (string | null | undefined) y devuelve la URL completa o `null` si no hay imagen. Usar siempre este helper para imágenes de catálogo/recordatorios.

En catálogo y recordatorios se usa así:

- Si `buildProductImageUrl(p.imagen)` devuelve `null` → mostrar placeholder (ej. `/product-placeholder.svg`).
- Si devuelve una URL → usar en `<img src={url} />` y opcionalmente `onError` para fallback a placeholder.

El detalle adicional (origen de rutas, convenciones del backend) está en el repo del backend en  
**`backend/INSTRUCCIONES_FRONTEND_IMAGENES_CATALOGO.md`** para quien toque el frontend.
