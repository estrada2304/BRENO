import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Command, Plus, Send, Sparkles, Video, X } from 'lucide-react'
import { serviceLabels, type Lead } from '../../types'
import { useWorkspace } from '../../lib/workspace'
import './breno-agent.css'

type ChatMessage = {
  id: string
  role: 'agent' | 'user'
  text: string
  leadIds?: string[]
}

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'agent',
  text: 'Saludos, Señor. Soy BRENO, su asistente de operaciones. Puedo buscar prospectos, preparar reuniones o consultar el estado de su estudio.',
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
}

function findLeads(query: string, availableLeads: Lead[]): Lead[] {
  const normalized = normalize(query)
  const matched = availableLeads.filter((lead) => {
    const searchable = normalize(`${lead.city} ${lead.industry} ${lead.companyName} ${lead.summary} ${serviceLabels[lead.serviceNeed]}`)
    const serviceMatches = normalized.includes('crm')
      ? lead.serviceNeed === 'crm'
      : normalized.includes('inventario')
        ? lead.serviceNeed === 'sistema-inventario'
        : normalized.includes('web') || normalized.includes('pagina')
          ? lead.serviceNeed === 'pagina-web'
          : true
    const cityMatch = /\b(madrid|valencia|barcelona|sevilla)\b/.exec(normalized)?.[0]
    return serviceMatches && (!cityMatch || searchable.includes(cityMatch))
  })
  return (matched.length ? matched : availableLeads).slice(0, 3)
}

function LeadCard({ lead, saved, onSave }: { lead: Lead; saved: boolean; onSave: () => void }) {
  return (
    <motion.article className="breno-lead-card" initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }}>
      <div className="breno-lead-card-top">
        <span className="breno-lead-avatar">{lead.companyName.slice(0, 1)}</span>
        <span className="breno-lead-company"><b>{lead.companyName}</b><small>{lead.industry} · {lead.city}</small></span>
        <a className="breno-lead-open" href={`mailto:?subject=${encodeURIComponent(`Contacto con ${lead.companyName}`)}`} aria-label={`Preparar contacto para ${lead.companyName}`}><ArrowUpRight size={14} /></a>
      </div>
      <p>{lead.summary}</p>
      <div className="breno-lead-card-footer">
        <span className="breno-lead-service"><i />{serviceLabels[lead.serviceNeed]}</span>
        <span className="breno-lead-score">{lead.fitScore}% afinidad</span>
      </div>
      <button type="button" className={`breno-save-lead ${saved ? 'is-saved' : ''}`} onClick={onSave} disabled={saved}>
        {saved ? <Check size={12} /> : <Plus size={12} />}{saved ? 'Añadido al pipeline' : 'Añadir a clientes'}
      </button>
    </motion.article>
  )
}

export default function BrenoAgent({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { leads: availableLeads, updateWorkspace } = useWorkspace()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])

  function sendMessage(value: string) {
    const text = value.trim()
    if (!text) return
    const isSearch = /busca|buscar|prospect|cliente|lead|crm|inventario|web/i.test(text)
    const leads = isSearch ? findLeads(text, availableLeads) : []
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text },
      {
        id: `agent-${Date.now() + 1}`,
        role: 'agent',
        text: isSearch
          ? `He encontrado ${leads.length} prospectos compatibles con su perfil de servicio, Señor. Son registros de ejemplo basados en los datos disponibles. Puede revisar cada perfil y añadirlo a su pipeline.`
          : 'Por supuesto, Señor. Puedo consultar los datos disponibles de clientes, proyectos y reuniones. Indíqueme qué desea revisar.',
        leadIds: leads.map(({ id }) => id),
      },
    ])
    setInput('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage(input)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage(input)
    }
  }

  function saveLead(lead: Lead) {
    updateWorkspace((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? { ...item, status: 'revisado' } : item) }))
    setMessages((current) => [...current, {
      id: `saved-${lead.id}-${Date.now()}`,
      role: 'agent',
      text: `He guardado ${lead.companyName} en el pipeline de prospectos, Señor.`,
    }])
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button className="breno-agent-backdrop" aria-label="Cerrar agente" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="breno-agent-panel" initial={{ x: 430, opacity: .7 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 430, opacity: .7 }} transition={{ type: 'spring', damping: 29, stiffness: 280 }} aria-label="Agente BRENO">
            <div className="breno-agent-scan" />
            <header className="breno-agent-header">
              <div className="breno-agent-brand-icon"><Sparkles size={17} /><motion.i animate={{ opacity: [.45, 1, .45], scale: [.85, 1.1, .85] }} transition={{ duration: 2.2, repeat: Infinity }} /></div>
              <div className="breno-agent-title"><b>Agente BRENO</b><small><span className="breno-agent-live-led" /> Copiloto de operaciones</small></div>
              <span className="breno-agent-header-spacer" />
              <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar agente"><X size={17} /></button>
            </header>

            <div className="breno-agent-session"><span><Command size={12} /> SESIÓN ACTIVA</span><i /> MOCK DATA</div>

            <div className="breno-chat-messages" aria-live="polite">
              {messages.map((message) => (
                <div className={`breno-chat-message ${message.role === 'user' ? 'from-user' : 'from-agent'}`} key={message.id}>
                  {message.role === 'agent' && <motion.span className="breno-message-led" animate={{ opacity: [.6, 1, .6], boxShadow: ['0 0 5px 1px rgba(37,231,247,.38)', '0 0 9px 3px rgba(37,231,247,.8)', '0 0 5px 1px rgba(37,231,247,.38)'] }} transition={{ duration: 2, repeat: Infinity }} />}
                  <div className="breno-message-body">
                    <p>{message.text}</p>
                    {!!message.leadIds?.length && <div className="breno-lead-results">{message.leadIds.map((leadId) => {
                      const lead = availableLeads.find(({ id }) => id === leadId)
                      return lead ? <LeadCard key={lead.id} lead={lead} saved={lead.status !== 'nuevo'} onSave={() => saveLead(lead)} /> : null
                    })}</div>}
                    {message.role === 'agent' && <small className="breno-message-time">Ahora · BRENO</small>}
                  </div>
                </div>
              ))}
            </div>

            <div className="breno-agent-bottom">
              <div className="breno-suggestions">
                {['Busca CRM en Madrid', 'Resume mis proyectos', 'Prepara mi día'].map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => sendMessage(suggestion)}>{suggestion}<ArrowUpRight size={11} /></button>
                ))}
              </div>
              <form className="breno-console" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="breno-agent-input">Mensaje para el agente BRENO</label>
                <textarea id="breno-agent-input" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Escribe una consulta…" rows={2} />
                <div className="breno-console-footer"><span><Video size={11} /> Mock data · sin conexión externa</span><button type="button" className="breno-console-add" aria-label="Añadir contexto"><Plus size={15} /></button><button type="submit" className="breno-send-button" aria-label="Enviar mensaje" disabled={!input.trim()}><Send size={14} /></button></div>
              </form>
              <div className="breno-agent-disclaimer">Las sugerencias son simuladas y puedes verificarlas antes de guardar.</div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
