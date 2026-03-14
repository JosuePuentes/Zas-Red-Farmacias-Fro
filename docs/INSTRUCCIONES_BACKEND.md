# Instrucciones para el Backend – Zas!

Este documento reúne todo lo que el backend debe implementar o ajustar para que el frontend funcione correctamente.

---

## 1. Imágenes de documentos (solicitudes de delivery) – Admin

**Problema:** En el panel Admin, al abrir "Ver detalles" de una solicitud de delivery, las imágenes (licencia, carnet, foto tipo carnet, vehículo) no cargan porque el frontend (ej. Vercel) y el backend (ej. Render) están en dominios distintos y el navegador bloquea por CORS.

**Solución recomendada – Endpoint proxy:**

- **Método y ruta:** `GET /api/admin/documento-imagen?path=...`
- **Query:** `path` = ruta del archivo, ej. `uploads/1773228646233-7wyyas9kxmb.jpeg`
- **Autenticación:** Solo usuarios admin (token o sesión).
- **Respuesta:** Leer el archivo desde disco (o tu storage) según `path` y devolver el binario con el `Content-Type` correcto (ej. `image/jpeg` para .jpeg, `image/png` para .png).
- **Seguridad:** Validar que `path` no salga de la carpeta de uploads (no permitir `../` ni rutas absolutas).

El frontend ya llama a esta URL. Si no existe el endpoint, las imágenes seguirán sin verse.

**Alternativa:** Habilitar CORS en la ruta estática `/uploads/*` (cabecera `Access-Control-Allow-Origin: *` o el origen de tu frontend). Si lo haces, el frontend podría volver a usar la URL directa; por ahora está usando el proxy.

---

## 2. Análisis de receta por imagen – texto OCR

**Endpoint:** `POST /api/cliente/recetas/analizar-imagen` (multipart con la imagen).

**Qué añadir en la respuesta JSON:**

- **`texto_receta`** (string, opcional): texto completo extraído del OCR de la imagen. Si tu análisis (Gemini u otro) devuelve el texto de la receta, envíalo aquí para que el frontend lo muestre en el cuadro "Texto de la receta".

Ejemplo de respuesta:

```json
{
  "es_recipe_valido": true,
  "medicamentos": [
    {
      "nombre": "Paracetamol",
      "concentracion": "500 mg",
      "dosis": "1 cada 8 h",
      "cantidad_total": 30
    }
  ],
  "texto_receta": "Dr. Juan Pérez\nReceta:\n- Paracetamol 500 mg. 1 tableta cada 8 horas. 30 tabletas."
}
```

---

## 3. Chat Dona – Comportamiento y formato

### 3.1 Personalidad

- Tono **dulce y cercano** (farmacéutica de confianza).
- **No repetir** en cada mensaje: "Claro, voy a buscar" ni "Recuerde consultar a su médico de confianza". El recordatorio del médico **solo una vez por conversación** o de forma natural.
- Usar el **nombre del cliente solo al inicio** de la conversación y cuando el cliente **vuelve otro día** (nueva sesión). No en cada mensaje.

### 3.2 Lógica de ventas

- Si el cliente menciona **acidez o malestar estomacal**: ofrecer antiácido y **sugerir agua mineral** ("más sana para la digestión").
- Cuando pregunten por un medicamento o precio: **no escribir** en el texto cosas como `[ACCION:CONSULTAR_PRECIO]`. El backend debe **ejecutar** la consulta a la base de datos, obtener precio y datos del producto, y **responder en texto natural** (ej. "El Paracetamol de 500 mg lo tenemos en $2,50. Aquí te lo dejo por si quieres agregarlo al carrito.").

### 3.3 Tarjetas de producto en el chat

- Si la respuesta incluye un producto (precio, foto, etc.), el backend debe **añadir al final del mensaje** (en el stream) una línea especial + JSON:

  ```
  __PRODUCTOS__
  [{"id":"...","codigo":"PARACETAMOL001","descripcion":"Paracetamol 500mg","precio":2.5,"imagen":"/uploads/paracetamol.jpg","farmaciaId":"..."}]
  ```

- El frontend quita ese bloque del texto visible y muestra una **tarjeta** con foto, precio y botón "Agregar al carrito".
- Campos útiles por producto: `id`, `codigo`, `descripcion`, `precio`, `imagen`, `farmaciaId` (opcional).

### 3.4 Memoria por cliente

- Guardar **historial de conversaciones** por cliente (por `userName` o `userId`).
- Cuando el mismo cliente vuelva (otra sesión / otro día), usar ese historial para que Dona pueda decir cosas como "¿Cómo sigues con tu dolor de cabeza?" o "¿Te estás tomando el tratamiento?".

### 3.5 Endpoint de chat

- **POST /api/chat**  
- Body: `{ userName, messages }`.  
- Respuesta: **streaming** de texto. Opcionalmente terminar el mensaje con `\n__PRODUCTOS__\n` + JSON array de productos (ver 3.3).

---

## 4. Recordatorios del cliente

- **GET /api/cliente/recordatorios:** devolver cada ítem con `hora` y `dias` si existen.
- **POST /api/cliente/recordatorios:** aceptar en el body además de lo actual:
  - **`hora`** (string): ej. `"14:00"`.
  - **`dias`** (array de strings o string): ej. `["lun","mar","vie"]` o `"diario"`.

El frontend ya envía estos campos. El backend debe guardarlos y usarlos para enviar notificaciones a la hora/días indicados.

---

## 5. Notificaciones (recordatorios y avisos)

- Cuando llegue la **hora** (o el día) de un recordatorio, el backend debe enviar la **notificación** (push o in-app).
- El **texto** debe ser en voz de **Dona**, por ejemplo:
  - "Recuerda tomarte tu pastilla de las 2:00 pm, [nombre]."
  - "Recuerda que solo tienes tratamiento para dos días; podemos realizar otra compra."
  - "Tus medicamentos de recordatorio bajaron de precio."
- En general, **todas las notificaciones** de la app (recordatorios, ofertas, pedidos) deberían redactarse como si las envía Dona (tono cercano y dulce).

---

## Resumen rápido de endpoints a implementar o revisar

| Qué | Endpoint | Acción |
|-----|----------|--------|
| Imágenes admin | `GET /api/admin/documento-imagen?path=uploads/...` | Implementar proxy que sirva el archivo con Content-Type correcto y auth admin. |
| Recetas OCR | `POST /api/cliente/recetas/analizar-imagen` | Añadir en la respuesta el campo `texto_receta` (string) con el texto OCR. |
| Chat Dona | `POST /api/chat` | No devolver `[ACCION:...]`; ejecutar consultas en backend; opcionalmente añadir `\n__PRODUCTOS__\n` + JSON al final del mensaje. |
| Recordatorios | `GET/POST /api/cliente/recordatorios` | Aceptar y devolver `hora` y `dias`; usar para notificaciones. |
| Notificaciones | (tu sistema de notificaciones) | Enviar recordatorios a la hora/día; redactar como Dona. |

Si quieres más detalle de algún punto, está en:
- `docs/BACKEND_ADMIN_IMAGENES_RECETAS.md` (imágenes admin y texto OCR recetas).
- `docs/DONA_BACKEND_INSTRUCCIONES.md` (Dona, recordatorios y notificaciones).
