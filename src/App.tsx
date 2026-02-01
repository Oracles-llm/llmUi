import { useEffect, useRef, useState } from 'react'
import './App.css'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || isLoading) return

    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content }])
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: content }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Request failed with ${response.status}`)
      }

      const data = (await response.json()) as { response?: string }
      const answer = data.response?.trim() || 'No response returned.'
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          Oracles LLM
          <span className="brand-pill">Thinking</span>
        </div>
        <div className="top-actions">
          <button className="icon-button" aria-label="User menu">
            <span className="icon-dot" />
          </button>
          <button className="icon-button" aria-label="Settings">
            <span className="icon-ring" />
          </button>
        </div>
      </header>

      <main className="content">
        <section className={`hero ${messages.length ? 'hero--compact' : ''}`}>
          <p className="hero-kicker">Studio mode</p>
          <h1>What are you working on?</h1>
          <p className="hero-subtitle">
            Ask your local assistant anything. Responses appear below as soon as the model finishes.
          </p>
        </section>

        <section className="chat-panel">
          {messages.length === 0 && !isLoading ? (
            <div className="empty-state">
              <div className="empty-glow" />
              <p>Start a single chat session. Nothing is saved.</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <article key={`${message.role}-${index}`} className={`message message--${message.role}`}>
                  <div className="message-role">{message.role === 'user' ? 'You' : 'Oracles'}</div>
                  <p className="message-text">{message.content}</p>
                </article>
              ))}
              {isLoading ? (
                <article className="message message--assistant message--loading">
                  <div className="message-role">Oracles</div>
                  <div className="typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </article>
              ) : null}
              <div ref={endRef} />
            </div>
          )}
        </section>
      </main>

      <footer className="composer">
        <div className="composer-shell">
          <div className="composer-row">
            <button className="icon-button" aria-label="Attach">
              <span className="icon-plus" />
            </button>
            <div className="composer-status">
              <span className="status-dot" />
              <span>Thinking</span>
            </div>
            <div className="composer-actions">
              <button className="icon-button" aria-label="Voice">
                <span className="icon-wave" />
              </button>
              <button
                className="send-button"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isLoading}
              >
                Send
              </button>
            </div>
          </div>

          <textarea
            className="composer-input"
            placeholder="Ask anything"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          {error ? <p className="error">{error}</p> : null}
          <p className="endpoint">Endpoint: {API_BASE_URL}/api/v1/chat</p>
        </div>
      </footer>
    </div>
  )
}

export default App
