import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import './auth.css'

type AuthMode = 'login' | 'signup' | 'reset' | 'update'

function friendlyAuthError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('invalid login credentials')) return 'El correo o la contraseña no coinciden.'
  if (value.includes('user already registered')) return 'Ya existe una cuenta con este correo. Inicia sesión.'
  if (value.includes('password should be at least')) return 'Usa una contraseña un poco más larga.'
  if (value.includes('email not confirmed')) return 'Confirma tu correo desde el mensaje que te enviamos.'
  if (value.includes('email address not authorized') || value.includes('email_not_authorized')) return 'El envío a este correo aún no está habilitado. Configura un SMTP de producción en Supabase.'
  if (value.includes('rate limit')) return 'Se alcanzó el límite temporal de correos. Espera un momento y vuelve a intentarlo.'
  return 'No se pudo completar la solicitud. Revisa los datos e inténtalo de nuevo.'
}

function authRedirect(path = '') {
  return new URL(`${import.meta.env.BASE_URL}${path}`, window.location.origin).toString()
}

export default function AuthScreen({ client }: { client: SupabaseClient }) {
  const [mode, setMode] = useState<AuthMode>(() => window.location.hash.includes('type=recovery') ? 'update' : 'login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const titles: Record<AuthMode, string> = {
    login: 'Qué bueno tenerte de vuelta',
    signup: 'Crea tu espacio de trabajo',
    reset: 'Recupera el acceso',
    update: 'Elige una nueva contraseña',
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        if (password.length < 8) throw new Error('password should be at least 8 characters')
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.')
        const { error: signupError } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: authRedirect('auth/callback'),
            data: { full_name: fullName.trim() },
          },
        })
        if (signupError) throw signupError
        setMessage('Te enviamos un correo de confirmación. Ábrelo para activar tu cuenta y entrar a BRENO.')
        setMode('login')
      } else if (mode === 'login') {
        const { error: loginError } = await client.auth.signInWithPassword({ email: email.trim(), password })
        if (loginError) throw loginError
      } else if (mode === 'reset') {
        const { error: resetError } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: authRedirect('auth/callback'),
        })
        if (resetError) throw resetError
        setMessage('Enviamos un enlace para cambiar tu contraseña. Revisa tu bandeja de entrada.')
      } else {
        if (password.length < 8) throw new Error('password should be at least 8 characters')
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.')
        const { error: updateError } = await client.auth.updateUser({ password })
        if (updateError) throw updateError
        await client.auth.signOut()
        window.history.replaceState({}, document.title, window.location.pathname)
        setMessage('Contraseña actualizada. Ya puedes iniciar sesión.')
        setPassword('')
        setConfirmPassword('')
        setMode('login')
      }
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : ''
      setError(detail === 'Las contraseñas no coinciden.' ? detail : friendlyAuthError(detail))
    } finally {
      setBusy(false)
    }
  }

  const isEmailMode = mode === 'signup' || mode === 'login' || mode === 'reset'
  const submitLabel: Record<AuthMode, string> = {
    login: 'Entrar a BRENO',
    signup: 'Crear cuenta',
    reset: 'Enviar enlace',
    update: 'Actualizar contraseña',
  }

  return (
    <main className="auth-screen">
      <div className="auth-atmosphere auth-atmosphere-one" /><div className="auth-atmosphere auth-atmosphere-two" />
      <motion.section className="auth-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32 }}>
        <div className="auth-panel-reflection" />
        <div className="auth-brand"><span className="auth-brand-mark">b.</span><span>BRENO<span className="auth-brand-dot">.</span></span><small>STUDIO OS</small></div>
        <div className="auth-kicker"><Sparkles size={13} /> ACCESO SEGURO</div>
        <h1>{titles[mode]}</h1>
        <p className="auth-intro">{mode === 'signup' ? 'Organiza clientes, proyectos y operaciones de tu agencia.' : mode === 'reset' ? 'Te enviaremos un enlace seguro para recuperar tu cuenta.' : mode === 'update' ? 'Tu cuenta estará protegida con la nueva clave.' : 'Entra a tu centro de operaciones y continúa donde lo dejaste.'}</p>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && <label>Nombre completo<input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" required maxLength={80} /></label>}
          {isEmailMode && <label>Correo electrónico<span className="auth-input-wrap"><Mail size={15} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" required /></span></label>}
          {(mode === 'login' || mode === 'signup' || mode === 'update') && <label>Contraseña<span className="auth-input-wrap"><LockKeyhole size={15} /><input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} required /></span></label>}
          {(mode === 'signup' || mode === 'update') && <label>Confirma tu contraseña<span className="auth-input-wrap"><LockKeyhole size={15} /><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repite la contraseña" minLength={8} required /></span></label>}
          {mode === 'login' && <button type="button" className="auth-text-button auth-forgot" onClick={() => switchMode('reset')}>¿Olvidaste tu contraseña?</button>}
          {error && <div className="auth-message auth-error" role="alert">{error}</div>}
          {message && <div className="auth-message auth-success" role="status"><CheckCircle2 size={15} />{message}</div>}
          <button type="submit" className="auth-submit" disabled={busy}>{busy ? 'Un momento…' : submitLabel[mode]}<ArrowRight size={15} /></button>
        </form>

        <div className="auth-mode-switch">
          {mode === 'login' && <>¿Aún no tienes acceso? <button type="button" onClick={() => switchMode('signup')}>Crear una cuenta</button></>}
          {mode === 'signup' && <>¿Ya tienes cuenta? <button type="button" onClick={() => switchMode('login')}>Iniciar sesión</button></>}
          {(mode === 'reset' || mode === 'update') && <button type="button" onClick={() => switchMode('login')}><ArrowLeft size={13} /> Volver al inicio de sesión</button>}
        </div>

        <div className="auth-security-note"><ShieldCheck size={14} /><span>Tu correo se usa para proteger y recuperar el acceso a tu espacio.</span></div>
      </motion.section>
      <p className="auth-footnote">BRENO STUDIO OS <span>·</span> Operaciones en orden, ideas en movimiento.</p>
    </main>
  )
}
