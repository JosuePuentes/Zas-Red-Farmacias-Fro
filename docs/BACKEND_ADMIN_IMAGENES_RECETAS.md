# Backend: imágenes de solicitudes Delivery y texto OCR en recetas

## 1. Imágenes de documentos (solicitudes de delivery) – CORS / proxy

En el panel Admin, al abrir "Ver detalles" de una solicitud de delivery, las imágenes (licencia, carnet de circulación, foto carnet, etc.) no cargan si el frontend está en otro dominio (ej. Vercel) y el backend en Render, por **CORS**: el navegador bloquea las peticiones `GET` a `https://tu-backend.onrender.com/uploads/...` cuando la página viene de otro origen.

### Opción A – Proxy en el backend (recomendada)

Implementar un endpoint que sirva el archivo desde el servidor (misma origen que el API), para que el frontend no haga la petición directa a `/uploads/`:

- **GET** `/api/admin/documento-imagen?path=uploads/1773228646233-7wyyas9kxmb.jpeg`
- Requiere autenticación de admin (token o sesión).
- Respuesta: leer el archivo desde disco (o storage) según `path`, devolver el binario con el `Content-Type` adecuado (ej. `image/jpeg`).
- El frontend ya usa esta URL cuando tienes el endpoint: construye  
  `getApiBaseUrl() + '/admin/documento-imagen?path=' + encodeURIComponent(path)`  
  para cada documento.

Así la petición del navegador va al mismo backend que ya expone el API y no hay CORS.

### Opción B – CORS en `/uploads/`

Si prefieres que el frontend siga usando la URL directa a `/uploads/...`, el backend debe enviar cabeceras CORS en las respuestas de esa ruta, por ejemplo:

- `Access-Control-Allow-Origin: *` (o el origen de tu frontend, ej. `https://tu-app.vercel.app`)

para las peticiones `GET` a `/uploads/*`. Si no las envías, el navegador seguirá bloqueando la carga de la imagen.

---

## 2. Análisis de receta por imagen – texto OCR en la respuesta

Para que en la pantalla de Recetas el **texto de la receta** aparezca automáticamente en el cuadro "Texto de la receta" después de analizar una foto, el backend debe incluir en la respuesta del análisis el texto extraído (OCR).

### Endpoint

- **POST** `/api/cliente/recetas/analizar-imagen` (body: multipart con la imagen).

### Respuesta JSON

Incluir un campo opcional con el texto completo de la receta:

- **`texto_receta`** (string, opcional): texto completo obtenido del OCR de la imagen (recomendado si usas Gemini u otro OCR). Ejemplo:

```json
{
  "es_recipe_valido": true,
  "medicamentos": [
    { "nombre": "Paracetamol", "concentracion": "500 mg", "dosis": "1 cada 8 h", "cantidad_total": 30 }
  ],
  "texto_receta": "Dr. Juan Pérez\nReceta:\n- Paracetamol 500 mg. 1 tableta cada 8 horas. 30 tabletas.\n..."
}
```

El frontend, si recibe `texto_receta`, lo escribe en el textarea "Texto de la receta" para que el usuario lo vea y pueda editarlo o reutilizarlo.
