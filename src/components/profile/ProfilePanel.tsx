import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, ImagePlus, LoaderCircle, Mail, Trash2, UserRound, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './profile.css'

type ProfilePanelProps = {
  userId: string
  email: string
  fullName: string
  jobTitle: string
  avatarPath: string
  avatarUrl: string
  onClose: () => void
  onSaved: (profile: { fullName: string; jobTitle: string; avatarPath: string }) => void
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const maxAvatarSize = 5 * 1024 * 1024

export default function ProfilePanel({ userId, email, fullName, jobTitle, avatarPath, avatarUrl, onClose, onSaved }: ProfilePanelProps) {
  const [name, setName] = useState(fullName)
  const [role, setRole] = useState(jobTitle)
  const [nextEmail, setNextEmail] = useState(email)
  const [photo, setPhoto] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(removePhoto ? '' : avatarUrl)
      return
    }
    const objectUrl = URL.createObjectURL(photo)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo, removePhoto, avatarUrl])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onClose])

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0]
    event.target.value = ''
    if (!next) return
    if (!allowedImageTypes.has(next.type)) {
      setError('Elige una imagen JPG, PNG, WebP o AVIF.')
      return
    }
    if (next.size > maxAvatarSize) {
      setError('La imagen debe pesar menos de 5 MB.')
      return
    }
    setError('')
    setNotice('')
    setRemovePhoto(false)
    setPhoto(next)
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const client = supabase
    if (!client) {
      setError('El perfil requiere iniciar sesión con Supabase.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')

    let nextAvatarPath: string | null = avatarPath || null
    let uploadedPath: string | null = null
    try {
      if (photo) {
        nextAvatarPath = `${userId}/avatar`
        const { error: uploadError } = await client.storage.from('profile-avatars').upload(nextAvatarPath, photo, {
          upsert: true,
          contentType: photo.type,
          cacheControl: '3600',
        })
        if (uploadError) throw uploadError
        uploadedPath = nextAvatarPath
      } else if (removePhoto) {
        nextAvatarPath = null
      }

      const { error: metadataError } = await client.auth.updateUser({
        data: {
          full_name: name.trim(),
          job_title: role.trim(),
          avatar_path: nextAvatarPath,
        },
      })
      if (metadataError) throw metadataError

      const normalizedEmail = nextEmail.trim().toLowerCase()
      const emailChanged = normalizedEmail !== email.toLowerCase()
      if (emailChanged) {
        const { error: emailError } = await client.auth.updateUser({ email: normalizedEmail })
        if (emailError) throw emailError
      }

      if (removePhoto && avatarPath) {
        const { error: removeError } = await client.storage.from('profile-avatars').remove([avatarPath])
        if (removeError) console.warn('No se pudo borrar la foto anterior del perfil.', removeError)
      }

      onSaved({ fullName: name.trim(), jobTitle: role.trim(), avatarPath: nextAvatarPath ?? '' })
      setPhoto(null)
      setRemovePhoto(false)
      setNotice(emailChanged
        ? 'Perfil guardado. Revisa el correo de confirmación para completar el cambio de dirección.'
        : 'Los cambios de tu perfil quedaron guardados.')
    } catch (caught) {
      if (uploadedPath) void client.storage.from('profile-avatars').remove([uploadedPath])
      setError(caught instanceof Error ? caught.message : 'No se pudieron guardar los cambios.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="profile-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
        <motion.section className="profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .2 }}>
          <header className="profile-panel-header">
            <div className="profile-heading-icon"><UserRound size={18} /></div>
            <div><span className="profile-eyebrow">TU ESPACIO</span><h2 id="profile-title">Perfil de usuario</h2><p>Personaliza cómo aparece tu cuenta en BRENO.</p></div>
            <button type="button" className="profile-close" aria-label="Cerrar panel de perfil" onClick={onClose} disabled={busy}><X size={17} /></button>
          </header>

          <form onSubmit={saveProfile}>
            <div className="profile-photo-block">
              <div className={`profile-photo-preview ${previewUrl ? 'has-image' : ''}`}>
                {previewUrl ? <img src={previewUrl} alt="Vista previa de tu foto de perfil" /> : <span>{name.trim().charAt(0).toUpperCase() || <UserRound size={25} />}</span>}
                <i><Camera size={13} /></i>
              </div>
              <div className="profile-photo-copy"><b>Foto de perfil</b><small>JPG, PNG, WebP o AVIF · máximo 5 MB</small>
                <div className="profile-photo-actions">
                  <button type="button" className="profile-subtle-button" onClick={() => inputRef.current?.click()}><ImagePlus size={14} /> Elegir imagen</button>
                  {(avatarPath || photo) && <button type="button" className="profile-remove-button" onClick={() => { setPhoto(null); setRemovePhoto(true); setError('') }}><Trash2 size={13} /> Quitar</button>}
                </div>
              </div>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={selectPhoto} hidden />
            </div>

            <div className="profile-fields">
              <label>Nombre completo<span className="profile-input"><UserRound size={15} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" maxLength={80} required /></span></label>
              <label>Correo electrónico<span className="profile-input"><Mail size={15} /><input type="email" value={nextEmail} onChange={(event) => setNextEmail(event.target.value)} required /></span><small>Si lo cambias, Supabase enviará un mensaje para verificar la nueva dirección.</small></label>
              <label>Cargo o especialidad <span className="profile-optional">OPCIONAL</span><span className="profile-input"><span className="profile-role-mark">↗</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ej. Fundadora · Desarrollo de software" maxLength={80} /></span></label>
            </div>

            {error && <p className="profile-message error" role="alert">{error}</p>}
            {notice && <p className="profile-message success" role="status"><Check size={14} />{notice}</p>}
            <footer className="profile-panel-footer"><span>La foto solo es visible para tu cuenta.</span><button type="submit" className="profile-save-button" disabled={busy}>{busy ? <LoaderCircle size={15} className="profile-spinner" /> : <Check size={15} />}{busy ? 'Guardando…' : 'Guardar cambios'}</button></footer>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  )
}

