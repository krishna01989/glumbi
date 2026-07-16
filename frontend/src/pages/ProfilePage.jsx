import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, voiceApi } from '../api/client'

function PasswordStrength({ password }) {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password),
  }
  return (
    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
      {[['length','8+ chars'],['uppercase','A-Z'],['number','0-9'],['special','!@#…']].map(([k,l]) => (
        <span key={k} style={{ fontSize: 11, fontWeight: 700, color: checks[k] ? '#27ae60' : '#bbb' }}>
          {checks[k] ? '✅' : '○'} {l}
        </span>
      ))}
    </div>
  )
}

export default function ProfilePage({ onLogout, parentOnly = false }) {
  const navigate = useNavigate()
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)

  // password change state
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwError, setPwError]       = useState('')
  const [pwSuccess, setPwSuccess]   = useState(false)

  // multi-voice state
  const [voices,        setVoices]        = useState([])   // [{id, name}]
  const [voiceMsg,      setVoiceMsg]      = useState(null) // {type, text}
  const [addingVoice,   setAddingVoice]   = useState(false)
  const [newVoiceName,  setNewVoiceName]  = useState('')
  const [uploading,     setUploading]     = useState(false)
  const [deletingId,    setDeletingId]    = useState(null)
  const [renamingId,    setRenamingId]    = useState(null)
  const [renameValue,   setRenameValue]   = useState('')
  const voiceInputRef = useRef(null)

  // recording state
  const [recording,      setRecording]      = useState(false)
  const [recordedBlob,   setRecordedBlob]   = useState(null)
  const [recordedUrl,    setRecordedUrl]    = useState(null)
  const [recordSeconds,  setRecordSeconds]  = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const timerRef         = useRef(null)

  // delete state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError]     = useState('')
  const [showDelete, setShowDelete]       = useState(false)

  const [quota,     setQuota]     = useState(null)
  const [breakdown, setBreakdown] = useState(null)

  useEffect(() => {
    userApi.getProfile().then(setProfile).finally(() => setLoading(false))
    voiceApi.list().then(setVoices).catch(() => {})
    userApi.quota().then(setQuota).catch(() => {})
    userApi.creditBreakdown().then(setBreakdown).catch(() => {})
  }, [])

  // ── Recording helpers ────────────────────────────────────────────────────

  async function startRecording() {
    setVoiceMsg(null)
    setRecordedBlob(null); setRecordedUrl(null); setRecordSeconds(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        setRecording(false)
        clearInterval(timerRef.current)
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    } catch {
      setVoiceMsg({ type: 'error', text: 'Microphone access denied. Please allow mic access and try again.' })
    }
  }

  function stopRecording() { mediaRecorderRef.current?.stop(); clearInterval(timerRef.current) }

  function discardRecording() {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedBlob(null); setRecordedUrl(null); setRecordSeconds(0); setVoiceMsg(null)
  }

  function fmtSeconds(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

  // ── Voice CRUD ────────────────────────────────────────────────────────────

  async function submitNewVoice(file) {
    const name = newVoiceName.trim()
    if (!name) { setVoiceMsg({ type: 'error', text: 'Please enter a name for this voice (e.g. Mom, Dad).' }); return }
    setVoiceMsg(null); setUploading(true)
    try {
      const saved = await voiceApi.create(file, name)
      setVoices(v => [...v, saved])
      setAddingVoice(false); setNewVoiceName('')
      discardRecording()
      setVoiceMsg({ type: 'success', text: `"${saved.name}" saved! Select it in the story reader to hear stories in this voice.` })
    } catch (err) {
      setVoiceMsg({ type: 'error', text: err.message || 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
      if (voiceInputRef.current) voiceInputRef.current.value = ''
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (file) await submitNewVoice(file)
  }

  async function handleRecordingUpload() {
    if (!recordedBlob) return
    const file = new File([recordedBlob], 'voice-sample.webm', { type: 'audio/webm' })
    await submitNewVoice(file)
  }

  async function handleDeleteVoice(id) {
    setDeletingId(id); setVoiceMsg(null)
    try {
      await voiceApi.delete(id)
      setVoices(v => v.filter(x => x.id !== id))
    } catch (err) {
      setVoiceMsg({ type: 'error', text: err.message || 'Could not delete voice.' })
    } finally { setDeletingId(null) }
  }

  async function handleRename(id) {
    const name = renameValue.trim()
    if (!name) return
    try {
      const updated = await voiceApi.rename(id, name)
      setVoices(v => v.map(x => x.id === id ? { ...x, name: updated.name } : x))
      setRenamingId(null); setRenameValue('')
    } catch (err) {
      setVoiceMsg({ type: 'error', text: err.message || 'Could not rename.' })
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwError(''); setPwSuccess(false)
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return }
    setPwLoading(true)
    try {
      await userApi.changePassword(currentPw, newPw)
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setDeleteLoading(true)
    try {
      await userApi.deleteAccount()
      onLogout()
    } catch (err) {
      setDeleteError(err.message)
      setDeleteLoading(false)
    }
  }

  const card = {
    background: 'white', borderRadius: 16,
    border: '1.5px solid #f0f0f0',
    padding: '28px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    marginBottom: 24,
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
    </div>
  )

  const isGoogle = profile?.authMethod === 'google'
  const joinedDate = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const accent      = parentOnly ? '#ff6b6b'  : 'var(--primary)'
  const accentLight = parentOnly ? '#fff0f0'  : 'var(--primary-lt)'
  const accentBorder= parentOnly ? '#ffcdb8'  : 'var(--primary-lt)'
  const btnGrad     = parentOnly ? 'linear-gradient(135deg,#ff6b6b,#f4845f)' : 'linear-gradient(135deg,var(--primary),var(--accent))'
  const onBack      = parentOnly ? () => navigate('/child') : () => navigate(-1)

  return (
    <div style={{ maxWidth: 520, margin: `${parentOnly ? '24px' : '0px'} auto`, padding: '0 16px', fontFamily: 'Nunito, sans-serif' }}>
      {parentOnly && (
        <button onClick={onBack}
          onMouseEnter={e => { e.currentTarget.style.background = accentLight; e.currentTarget.style.transform = 'translateX(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none' }}
          style={{
            background: 'transparent', border: `1.5px solid ${accentBorder}`, color: accent,
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            padding: '6px 14px', marginBottom: 20, borderRadius: 50,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s ease',
          }}>
          ← Back
        </button>
      )}

      {/* Hero header */}
      <div style={{
        background: btnGrad, borderRadius: 20, padding: '28px 28px 24px',
        marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 100, opacity: 0.08, lineHeight: 1 }}>👤</div>
        <div style={{ fontSize: 42, marginBottom: 10 }}>👤</div>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{profile?.email}</div>
        <div style={{ fontSize: 13, opacity: 0.8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>{isGoogle ? '🔵 Google sign-in' : '🔑 Email & password'}</span>
          <span>Member since {joinedDate}</span>
        </div>
      </div>

      {/* AI Credits */}
      {quota && (() => {
        const overLimit = quota.used > quota.limit
        const pct = Math.min(quota.used / quota.limit, 1)
        const barColor    = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#f5a623' : '#6bcb77'
        const statusColor = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#f5a623' : '#27ae60'
        const statusBg    = pct >= 1 ? '#fff0f0' : pct >= 0.8 ? '#fffbf0' : '#f0fff4'
        const statusLabel = overLimit ? '⛔ Over limit' : pct >= 1 ? '🚫 Limit reached' : pct >= 0.8 ? '⚠️ Almost full' : '✅ Good'
        const childRows   = breakdown ? (breakdown.children || []).filter(d => d.totalCredits > 0) : []
        return (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
                🤖 AI Credits
              </h3>
              <span style={{ fontSize: 12, fontWeight: 800, color: statusColor, background: statusBg, padding: '4px 10px', borderRadius: 50 }}>
                {statusLabel}
              </span>
            </div>

            <div style={{ height: 10, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: childRows.length > 0 ? 20 : 0 }}>
              <span style={{ fontSize: 12, color: '#bbb' }}>Resets 1st of each month</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#555' }}>{quota.used} / {quota.limit} cr</span>
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{quota.usedActual ?? quota.used} used this month (total)</div>
              </div>
            </div>

            {childRows.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {childRows.map(({ childId, name, avatarEmoji, theme, totalCredits, features }) => {
                  const THEMES_MAP = { coral: '#ff6b6b', sky: '#4fc3f7', mint: '#43c98a', lavender: '#9b59b6', sunshine: '#f5a623' }
                  const childAccent = THEMES_MAP[theme] || accent
                  const childAccentLt = childAccent + '18'
                  return (
                    <div key={childId} style={{ background: '#fafafa', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: childAccentLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                          {avatarEmoji}
                        </div>
                        <span style={{ fontWeight: 900, fontSize: 15, color: '#333', flex: 1 }}>{name}</span>
                        <span style={{ fontWeight: 900, fontSize: 14, color: childAccent, background: childAccentLt, padding: '3px 10px', borderRadius: 50 }}>{totalCredits} cr</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {features.filter(f => f.credits > 0).map(f => (
                          <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15 }}>{f.icon || '🤖'}</span>
                            <span style={{ flex: 1, fontSize: 13, color: '#666', fontWeight: 600 }}>{f.label}</span>
                            <span style={{ fontSize: 11, color: '#bbb' }}>×{f.count}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#888', minWidth: 40, textAlign: 'right' }}>{f.credits} cr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {breakdown && childRows.length === 0 && (
              <div style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '8px 0' }}>✨ No AI usage this month</div>
            )}
          </div>
        )
      })()}

      {/* Change password — password accounts only */}
      {!isGoogle && (
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 20px' }}>
            🔑 Change Password
          </h3>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Current password">
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••" required style={inputStyle} />
            </Field>
            <Field label="New password">
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="••••••••" required style={inputStyle} />
              {newPw.length > 0 && <PasswordStrength password={newPw} />}
            </Field>
            <Field label="Confirm new password">
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                placeholder="••••••••" required style={inputStyle} />
            </Field>
            {pwError && (
              <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                🚫 {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ background: '#f0fff4', border: '1.5px solid #6bcb77', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1e6b3c', fontWeight: 600 }}>
                ✅ Password updated successfully
              </div>
            )}
            <button type="submit" disabled={pwLoading}
              style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 50, fontSize: 14, fontWeight: 800, background: btnGrad, color: 'white', border: 'none', cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
              {pwLoading ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Custom Story Voices */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            🎙️ Story Voices
          </h3>
          {voices.length > 0 && voices.length < 5 && !addingVoice && (
            <button onClick={() => { setAddingVoice(true); setVoiceMsg(null) }}
              style={{ padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 800, background: btnGrad, color: 'white', border: 'none', cursor: 'pointer' }}>
              + Add voice
            </button>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.6 }}>
          Add up to 5 voices (Mom, Dad, Granny…). Choose one when listening to a story.
        </p>

        {/* Existing voices list */}
        {voices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: addingVoice ? 16 : 0 }}>
            {voices.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9f9f9', borderRadius: 12, padding: '10px 14px' }}>
                <span style={{ fontSize: 20 }}>🎙️</span>
                {renamingId === v.id ? (
                  <>
                    <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                      autoFocus onKeyDown={e => e.key === 'Enter' && handleRename(v.id)}
                      style={{ flex: 1, padding: '5px 10px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13, fontFamily: 'Nunito, sans-serif' }} />
                    <button onClick={() => handleRename(v.id)}
                      style={{ padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setRenamingId(null)}
                      style={{ padding: '5px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#f0f0f0', color: '#666', border: 'none', cursor: 'pointer' }}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#333' }}>{v.name}</span>
                    <button onClick={() => { setRenamingId(v.id); setRenameValue(v.name) }}
                      style={{ padding: '4px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: '#f0f0f0', color: '#666', border: 'none', cursor: 'pointer' }}>Rename</button>
                    <button onClick={() => handleDeleteVoice(v.id)} disabled={deletingId === v.id}
                      style={{ padding: '4px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: '#fff0f0', color: '#e74c3c', border: 'none', cursor: 'pointer' }}>
                      {deletingId === v.id ? '…' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add voice panel */}
        {(addingVoice || voices.length === 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Voice name (e.g. Mom, Dad, Granny)">
              <input value={newVoiceName} onChange={e => setNewVoiceName(e.target.value)}
                placeholder="Mom" maxLength={50} style={inputStyle} disabled={recording || uploading} />
            </Field>
            {!recording && !recordedBlob && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={startRecording}
                  style={{ padding: '10px 20px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: btnGrad, color: 'white', border: 'none', cursor: 'pointer' }}>
                  🎙️ Record my voice
                </button>
                <button onClick={() => voiceInputRef.current?.click()}
                  style={{ padding: '10px 20px', borderRadius: 50, fontSize: 13, fontWeight: 700, background: '#f5f5f5', color: '#555', border: '1.5px solid #eee', cursor: 'pointer' }}>
                  📁 Upload audio file
                </button>
                {voices.length > 0 && (
                  <button onClick={() => { setAddingVoice(false); setNewVoiceName(''); setVoiceMsg(null) }}
                    style={{ padding: '10px 16px', borderRadius: 50, fontSize: 13, fontWeight: 700, background: '#f5f5f5', color: '#888', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recording in progress */}
        {recording && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#e74c3c', display: 'inline-block', animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e74c3c' }}>Recording… {fmtSeconds(recordSeconds)}</span>
            </div>
            <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>Speak naturally for 1–3 minutes. Read a story, describe your day, anything.</p>
            <button onClick={stopRecording}
              style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 50, fontSize: 14, fontWeight: 800, background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}>
              ⏹ Stop
            </button>
          </div>
        )}

        {/* Playback + confirm */}
        {recordedBlob && !recording && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#555', fontWeight: 700, margin: 0 }}>Listen back — does it sound good?</p>
            <audio controls src={recordedUrl} style={{ width: '100%', borderRadius: 8 }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={handleRecordingUpload} disabled={uploading}
                style={{ padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: btnGrad, color: 'white', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Saving…' : '✅ Use this recording'}
              </button>
              <button onClick={discardRecording} disabled={uploading}
                style={{ padding: '10px 18px', borderRadius: 50, fontSize: 13, fontWeight: 700, background: '#f5f5f5', color: '#555', border: 'none', cursor: 'pointer' }}>
                🔄 Re-record
              </button>
            </div>
          </div>
        )}

        <input ref={voiceInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileUpload} />

        {uploading && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Cloning your voice… this may take 20–30 seconds.
          </div>
        )}

        {voiceMsg && (
          <div style={{
            marginTop: 12, borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600,
            background: voiceMsg.type === 'success' ? '#f0fff4' : '#fff0f0',
            border: `1.5px solid ${voiceMsg.type === 'success' ? '#6bcb77' : '#ffb3b3'}`,
            color: voiceMsg.type === 'success' ? '#1e6b3c' : '#c0392b',
          }}>
            {voiceMsg.type === 'success' ? '✅' : '🚫'} {voiceMsg.text}
          </div>
        )}
      </div>

      {/* Danger zone divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 20px' }}>
        <div style={{ flex: 1, height: 1, background: '#ffe0e0' }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: '#e74c3c', textTransform: 'uppercase', letterSpacing: 1 }}>Danger zone</span>
        <div style={{ flex: 1, height: 1, background: '#ffe0e0' }} />
      </div>

      {/* Delete account */}
      <div style={{ ...card, background: '#fff9f9', border: '1.5px solid #ffe0e0', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>🗑️</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: '#e74c3c', marginBottom: 4 }}>Delete Account</div>
            <p style={{ fontSize: 13, color: '#999', margin: 0, lineHeight: 1.6 }}>
              Permanently deletes your account and all your children's stories, activities, and data. This cannot be undone.
            </p>
          </div>
        </div>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            style={{ padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: '#fff0f0', color: '#e74c3c', border: '1.5px solid #fcc', cursor: 'pointer' }}>
            Delete my account
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#c0392b', fontWeight: 700, margin: 0 }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="DELETE" style={{ ...inputStyle, borderColor: '#fcc' }} />
            {deleteError && (
              <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                🚫 {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                style={{ padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: deleteConfirm === 'DELETE' ? '#e74c3c' : '#ccc', color: 'white', border: 'none', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed' }}>
                {deleteLoading ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                style={{ padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 700, background: '#f5f5f5', color: '#555', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
      <span style={{ color: '#999', fontWeight: 700 }}>{label}</span>
      <span style={{ color: '#2d2d2d', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #eee', fontSize: 14, boxSizing: 'border-box',
  fontFamily: 'Nunito, sans-serif',
}
