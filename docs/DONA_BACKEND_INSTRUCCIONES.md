# Instrucciones para el backend: Dona, recordatorios y notificaciones

## 1. Personalidad y fluidez de Dona

### Tono
- **Dulce y cercana**, como una farmacéutica de confianza venezolana. Sin ser repetitiva ni mecánica.
- **No repetir en cada mensaje**:
  - "Claro, voy a buscar"
  - "Recuerde consultar a su médico de confianza" → **solo una vez por conversación** o de forma natural al recomendar un medicamento, no al final de cada respuesta.
- Hablar con **fluidez**: respuestas cortas y naturales, sin fórmulas fijas.

### Uso del nombre del cliente
- **Solo al inicio** de la conversación: "Hola [nombre], soy Dona…"
- **No repetir el nombre** en cada mensaje.
- Volver a usar el nombre **solo cuando el cliente regrese otro día u horas después** (nueva sesión): por ejemplo "Hola [nombre], ¿en qué te ayudo hoy?" o "¿Cómo sigues con lo del dolor de cabeza?".

---

## 2. Lógica de ventas (chispa)

### Acidez / dolor de barriga
- Si el cliente menciona **acidez** o **malestar estomacal**:
  - Ofrecer un **antiácido**.
  - Sugerir **proactivamente** agua mineral: "También te conviene nuestra agua mineral, es más sana para la digestión."

### Consulta de precio / producto
- Cuando el usuario pregunte por un medicamento (ej. "¿Tienen Paracetamol?" o "Dame el precio"):
  - **No escribir** en el texto `[ACCION:CONSULTAR_PRECIO]` ni ninguna etiqueta similar.
  - **Ejecutar en el backend** la función que consulta MongoDB (o tu base de productos), obtener precio, descripción, imagen, codigo, id.
  - Responder **en texto natural**, por ejemplo: "Mira [nombre si es inicio de sesión], el Paracetamol de 500 mg lo tenemos en $2,50. Aquí te dejo la foto por si quieres que te lo enviemos de una vez, Zas!"
  - Incluir en la respuesta los datos del producto para que el frontend muestre la **tarjeta visual** (ver sección 3).

---

## 3. Function calling y formato de productos en el chat

### Regla
- La IA **nunca** debe escribir en el mensaje cosas como `[ACCION:CONSULTAR_PRECIO codigo="..."]`.
- El **backend** debe:
  1. Interpretar la intención (consultar precio, agregar al carrito, ir a pago).
  2. Llamar a tu base de datos o servicios internos.
  3. Generar el **texto natural** de Dona y, si aplica, adjuntar el **array de productos** para la UI.

### Formato para mostrar tarjetas en el chat (frontend)
- Al final del mensaje de texto que envías al frontend (streaming), puedes añadir una línea especial seguida de un JSON array de productos:
  ```
  __PRODUCTOS__
  [{"id":"...","codigo":"PARACETAMOL001","descripcion":"Paracetamol 500mg","precio":2.5,"imagen":"/uploads/paracetamol.jpg","farmaciaId":"..."}]
  ```
- El frontend **parsea** esta línea, **quita** el bloque del texto visible y **muestra** una tarjeta por producto (foto, descripción, precio, botón "Agregar al carrito").
- Campos útiles por producto: `id`, `codigo`, `descripcion`, `precio`, `imagen`, `farmaciaId` (opcional).

### Ejemplo de flujo backend
1. Usuario: "Dame el precio del Paracetamol"
2. Backend: busca en MongoDB el producto, obtiene `{ id, codigo, descripcion, precio, imagen }`.
3. Backend: genera texto tipo: "El Paracetamol de 500 mg lo tenemos en $2,50. Aquí te lo dejo por si quieres agregarlo al carrito."
4. Backend: concatena al final del mensaje: `\n__PRODUCTOS__\n` + `JSON.stringify([producto])`.
5. Frontend: muestra el texto sin el bloque y renderiza la tarjeta con botón "Agregar al carrito".

---

## 4. Memoria e historial por cliente

- **Guardar conversaciones** por cliente (por `userName` o `userId`) en base de datos, no solo en el chat actual.
- Cuando el **mismo cliente vuelva** (otra sesión / otro día):
  - Dona debe poder **recordar** temas anteriores (ej. "¿Cómo sigues con tu dolor de cabeza?", "¿Te estás tomando el tratamiento?").
  - Incluir en el contexto de la IA un resumen o los últimos mensajes de conversaciones pasadas (o un embedding/búsqueda) para que Dona responda con continuidad y educación.

---

## 5. Dona y recordatorios del cliente

- **Conectar** Dona con el módulo de **recordatorios** del cliente:
  - Si el cliente va a comprar un medicamento (ej. para la tensión), Dona puede **preguntar**: "¿Es para ti? ¿Lo tienes que tomar con frecuencia? Si quieres, lo agrego a tus medicamentos para recordar y te aviso cuando tomes tu pastilla."
- **Recordatorios** en backend y frontend ya soportan:
  - `hora`: hora de toma (ej. "14:00").
  - `dias`: días de la semana (ej. `["lun","mar","mie"]`) o "diario".
- Cuando llegue la **hora** (o el día) del recordatorio:
  - El backend debe enviar una **notificación** (push o in-app).
  - El **texto** debe ser como si **Dona** hablara, por ejemplo:
    - "Recuerda tomarte tu pastilla de las 2:00 pm, [nombre]."
    - "Recuerda que solo tienes tratamiento para dos días; podemos realizar otra compra."
    - "Dona: Tus medicamentos de recordatorio bajaron de precio."
- **Todas las notificaciones** de la app (recordatorios, ofertas, pedidos, etc.) deben redactarse como si **Dona** las envía (mismo tono dulce y cercano).

---

## 6. Resumen de endpoints y datos

### Chat
- **POST /api/chat**: body `{ userName, messages }`. Respuesta: streaming de texto. Opcionalmente terminar con `\n__PRODUCTOS__\n` + JSON array de productos para tarjetas en el chat.

### Recordatorios
- **GET /api/cliente/recordatorios**: devolver items con `hora` y `dias` si existen.
- **POST /api/cliente/recordatorios**: aceptar en el body `hora` (string, ej. "14:00") y `dias` (array de strings, ej. `["lun","mar","vie"]` o string "diario") además de codigo, descripcion, imagen, precioReferencia.

### Notificaciones
- Implementar en backend el envío de notificaciones (push o in-app) para recordatorios y otros eventos, con **texto en voz de Dona** y, cuando aplique, el nombre del cliente.
