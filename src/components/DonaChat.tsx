import { useEffect, useMemo, useRef, useState } from 'react'
import { getApiBaseUrl } from '../api'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

interface DonaChatProps {
  userName: string
}

export default function DonaChat({ userName }: DonaChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const apiBase = useMemo(() => getApiBaseUrl(), [])

  useEffect(() => {
    if (!open || messages.length === 0) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [open, messages])

  function initialSystemMessage(): ChatMessage {
    const nombre = userName || 'cliente'
    const saludo = `Hola ${nombre}. Soy Dona, tu auxiliar de confianza para salud y medicamentos. Cuéntame directamente qué necesitas y te ayudo.`
    return {
      id: 'dona-inicial',
      role: 'assistant',
      content: saludo,
    }
  }

  function ensureStarted() {
    if (messages.length === 0) {
      setMessages([initialSystemMessage()])
    }
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return

    setError(null)
    ensureStarted()

    const idUser = `u-${Date.now()}`
    const idBot = `a-${Date.now()}`

    const prevMessages = messages.length === 0 ? [initialSystemMessage()] : messages
    const nextMessages: ChatMessage[] = [
      ...prevMessages,
      { id: idUser, role: 'user', content: text },
      { id: idBot, role: 'assistant', content: '' },
    ]

    setMessages(nextMessages)
    setInput('')

    try {
      setStreaming(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('zas_token') : null

      const body = {
        userName,
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
      }

      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })

      if (!res.ok || !res.body) {
        throw new Error('No se pudo conectar con Dona.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let done = false
      let buffer = ''
      let currentText = ''

      while (!done) {
        const result = await reader.read()
        done = result.done ?? false
        if (result.value) {
          buffer += decoder.decode(result.value, { stream: !done })
          currentText += buffer
          buffer = ''

          setMessages((curr) =>
            curr.map((m) => (m.id === idBot ? { ...m, content: currentText } : m)),
          )
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener respuesta de Dona.'
      setError(msg)
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="dona-chat-toggle"
        onClick={() => {
          setOpen((v) => !v)
          if (!open) ensureStarted()
        }}
        aria-label={open ? 'Cerrar chat con Dona' : 'Abrir chat con Dona'}
      >
        <span className="dona-chat-toggle-icon">💬</span>
        <span className="dona-chat-toggle-text">Habla con Dona</span>
      </button>

      {open && (
        <div className="dona-chat-window">
          <div className="dona-chat-header">
            <div>
              <div className="dona-chat-title">Dona</div>
              <div className="dona-chat-subtitle">Tu auxiliar de confianza</div>
            </div>
            <button
              type="button"
              className="dona-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>
          <div className="dona-chat-messages" ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === 'assistant' ? 'dona-msg dona-msg-assistant' : 'dona-msg dona-msg-user'}
              >
                <div className="dona-msg-bubble">
                  {m.content}
                </div>
              </div>
            ))}
            {streaming && (
              <div className="dona-msg dona-msg-assistant">
                <div className="dona-msg-bubble dona-typing">Dona está escribiendo…</div>
              </div>
            )}
          </div>
          {error && <div className="dona-chat-error">{error}</div>}
          <form className="dona-chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Escribe tu duda o lo que necesitas…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={streaming}
            />
            <button type="submit" className="btn btn-primary" disabled={streaming || !input.trim()}>
              {streaming ? 'Enviando…' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

