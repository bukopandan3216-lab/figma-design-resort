// ===== START CUT: components/auth/LoginView.jsx =====
function LoginView({ onBack, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const { surface, text, text2, card, border, dm } = useTheme()
  const icAuth = 'rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400 transition-all'

  function SocialBtn({ icon, label }) {
    return (
      <button type="button" onClick={() => onSuccess({ firstName: 'Guest', lastName: 'User', email: 'guest@example.com', phone: '', username: 'guest' })} className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all">{icon}{label}</button>
    )
  }
  function Divider({ text }) {
    return (
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{text}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img src={BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0.24) 100%)' }} />

      {/* Desktop */}
      <div className="hidden md:flex relative z-10 h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-white select-none px-8 relative">
          <button onClick={onBack} className="absolute top-5 left-5 flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
            <ChevL /> Back to Website
          </button>
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
          <h1 className="text-5xl font-bold text-white mt-2 text-center leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
          <p className="text-xl text-white/90 mt-1" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
          <p className="text-white/60 text-[11px] tracking-[0.32em] uppercase mt-4 font-light">Reserve your slice of paradise</p>
        </div>
        <div className="flex items-center justify-center p-5" style={{ width: 440 }}>
          <div className="rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 40px)', background: card, border: `1px solid ${border}` }}>
            <div className="flex-1 min-h-0 overflow-y-auto px-7 py-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${GOLD}60, transparent)` }} />
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Palawan Paraíso</p>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${GOLD}60, transparent)` }} />
              </div>
              {mode === 'login' ? (
                <>
                  <div className="mb-5">
                    <h2 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Welcome Back</h2>
                    <p className="text-[11px] mt-1" style={{ color: text2 }}>Sign in to your Palawan account</p>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); onSuccess({ firstName: username || 'Guest', lastName: '', email: '', phone: '', username }) }} className="space-y-3">
                    <FLabel label="Username" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required /></FLabel>
                    <FLabel label="Password" req>
                      <div className="relative">
                        <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showPwd} /></button>
                      </div>
                    </FLabel>
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded w-3.5 h-3.5 accent-[#38875C]" />
                        <span className="text-[11px]" style={{ color: text2 }}>Remember me</span>
                      </label>
                      <button type="button" className="text-[11px] font-medium hover:underline" style={{ color: GREEN }}>Forgot password?</button>
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 hover:shadow-lg transition-all mt-1" style={{ background: GREEN }}>Sign In</button>
                  </form>
                  <Divider text="or sign up using" />
                  <div className="space-y-2">
                    <SocialBtn icon={<IGoogleIcon />} label="Continue with Google" />
                    <SocialBtn icon={<IFBIcon />} label="Continue with Facebook" />
                    <SocialBtn icon={<IIGIcon />} label="Continue with Instagram" />
                  </div>
                  <p className="text-center text-[11px] mt-5" style={{ color: text2 }}>Don&apos;t have an account? <button onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign up</button></p>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <h2 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Create Account</h2>
                    <p className="text-[11px] mt-1" style={{ color: text2 }}>Join Palawan Paraíso Resort &amp; Spa</p>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); onSuccess({ firstName, lastName, email, phone: '', username: email.split('@')[0] || firstName }) }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FLabel label="First Name" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Maria" value={firstName} onChange={e => setFirstName(e.target.value)} required /></FLabel>
                      <FLabel label="Last Name" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Santos" value={lastName} onChange={e => setLastName(e.target.value)} required /></FLabel>
                    </div>
                    <FLabel label="Email Address" req><input className={icAuth} style={icStyle(surface, text)} type="email" placeholder="maria@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></FLabel>
                    <FLabel label="Password" req>
                      <div className="relative">
                        <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showPwd} /></button>
                      </div>
                    </FLabel>
                    <FLabel label="Confirm Password" req>
                      <div className="relative">
                        <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
                        <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showConfirm} /></button>
                      </div>
                      {confirmPwd && password !== confirmPwd && <p className="text-[10px]" style={{ color: '#B45555' }}>Passwords do not match</p>}
                    </FLabel>
                    <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 hover:shadow-lg transition-all mt-1" style={{ background: GREEN }}>Create Account</button>
                  </form>
                  <Divider text="or sign up using" />
                  <div className="space-y-2">
                    <SocialBtn icon={<IGoogleIcon />} label="Sign up with Google" />
                    <SocialBtn icon={<IFBIcon />} label="Sign up with Facebook" />
                    <SocialBtn icon={<IIGIcon />} label="Sign up with Instagram" />
                  </div>
                  <p className="text-center text-[11px] mt-5" style={{ color: text2 }}>Already have an account? <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign in</button></p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden relative z-10 flex-col h-full overflow-y-auto safe-top">
        <div className="shrink-0 pt-3 pb-4 px-5 text-center text-white select-none relative">
          <button onClick={onBack} className="absolute left-4 top-4 flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors">
            <ChevL /> Back
          </button>
          <p className="text-[9px] font-medium tracking-[0.28em] uppercase mt-1" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
          <h1 className="text-2xl font-bold text-white leading-tight mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
          <p className="text-sm text-white/85" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
        </div>
        {/* ── Mobile card ── */}
        <div className={`${mode === 'login' ? 'shrink-0' : 'flex-1'} mx-3 mb-3 rounded-2xl shadow-2xl overflow-hidden flex flex-col safe-bottom`} style={{ background: card }}>
          <div className="overflow-y-auto px-5 py-5">
            {/* branding line */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${GOLD}60, transparent)` }} />
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Palawan Paraíso</p>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${GOLD}60, transparent)` }} />
            </div>

            {mode === 'login' ? (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Welcome Back</h2>
                <p className="text-[11px] mb-4" style={{ color: text2 }}>Sign in to your Palawan account</p>
                <form onSubmit={e => { e.preventDefault(); onSuccess({ firstName: username || 'Guest', lastName: '', email: '', phone: '', username }) }} className="space-y-3">
                  <FLabel label="Username" req><input className={ic} style={icStyle(surface, text)} placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required /></FLabel>
                  <FLabel label="Password" req>
                    <div className="relative">
                      <input className={ic + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: text2 }}><IEye off={showPwd} /></button>
                    </div>
                  </FLabel>
                  <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90" style={{ background: GREEN }}>Sign In</button>
                </form>
                <Divider text="or sign in using" />
                <div className="space-y-2">
                  <SocialBtn icon={<IGoogleIcon />} label="Continue with Google" />
                  <SocialBtn icon={<IFBIcon />} label="Continue with Facebook" />
                  <SocialBtn icon={<IIGIcon />} label="Continue with Instagram" />
                </div>
                <p className="text-center text-[11px] mt-4 pb-2" style={{ color: text2 }}>Don&apos;t have an account? <button onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign up</button></p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Create Account</h2>
                <p className="text-[11px] mb-4" style={{ color: text2 }}>Join Palawan Paraíso Resort &amp; Spa</p>
                <form onSubmit={e => { e.preventDefault(); if (password !== confirmPwd) return; onSuccess({ firstName, lastName, email, phone, username: username || email }) }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FLabel label="First Name" req><input className={ic} style={icStyle(surface, text)} placeholder="Maria" value={firstName} onChange={e => setFirstName(e.target.value)} required /></FLabel>
                    <FLabel label="Last Name" req><input className={ic} style={icStyle(surface, text)} placeholder="Santos" value={lastName} onChange={e => setLastName(e.target.value)} required /></FLabel>
                  </div>
                  <FLabel label="Email" req><input className={ic} style={icStyle(surface, text)} type="email" placeholder="maria@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></FLabel>
                  <FLabel label="Phone"><input className={ic} style={icStyle(surface, text)} placeholder="+63 9XX XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} /></FLabel>
                  <FLabel label="Password" req>
                    <div className="relative">
                      <input className={ic + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: text2 }}><IEye off={showPwd} /></button>
                    </div>
                  </FLabel>
                  <FLabel label="Confirm Password" req>
                    <div className="relative">
                      <input className={ic + ' pr-10'} style={icStyle(surface, text)} type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: text2 }}><IEye off={showConfirm} /></button>
                    </div>
                    {confirmPwd && password !== confirmPwd && <p className="text-[10px] mt-1" style={{ color: '#B45555' }}>Passwords do not match</p>}
                  </FLabel>
                  <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90" style={{ background: GREEN }}>Create Account</button>
                </form>
                <Divider text="or sign up using" />
                <div className="space-y-2">
                  <SocialBtn icon={<IGoogleIcon />} label="Sign up with Google" />
                  <SocialBtn icon={<IFBIcon />} label="Sign up with Facebook" />
                  <SocialBtn icon={<IIGIcon />} label="Sign up with Instagram" />
                </div>
                <p className="text-center text-[11px] mt-4 pb-2" style={{ color: text2 }}>Already have an account? <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign in</button></p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}