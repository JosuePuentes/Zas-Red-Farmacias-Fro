import { GoogleGenerativeAI } from '@google/generative-ai'

type AnalisisReceta = {
  medicamento: string
  dosis: string
  cantidad: string
  es_recipe: boolean
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  // Convertimos a base64
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

export async function analizarRecetaDesdeImagen(file: File): Promise<AnalisisReceta> {
  if (!genAI || !apiKey) {
    return { medicamento: '', dosis: '', cantidad: '', es_recipe: false }
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const base64 = await fileToBase64(file)

  const prompt =
    'Eres un asistente de farmacia en Zulia, Venezuela. Tu tarea es analizar este récipe médico. ' +
    'Extrae el nombre del medicamento, la concentración y la cantidad. ' +
    'Responde EXCLUSIVAMENTE en un objeto JSON con este formato: ' +
    '{ "medicamento": string, "dosis": string, "cantidad": string, "es_recipe": boolean }. ' +
    'Si la imagen no parece un récipe médico, pon es_recipe en false.'

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: base64,
        mimeType: file.type || 'image/jpeg',
      },
    },
  ])

  const response = result.response
  const text = response.text().trim()

  try {
    // Gemini suele envolver la respuesta en ```json ... ```; limpiamos eso si viene así
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as AnalisisReceta
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Respuesta inválida')
    }
    return {
      medicamento: parsed.medicamento || '',
      dosis: parsed.dosis || '',
      cantidad: parsed.cantidad || '',
      es_recipe: Boolean(parsed.es_recipe),
    }
  } catch {
    return { medicamento: '', dosis: '', cantidad: '', es_recipe: false }
  }
}

