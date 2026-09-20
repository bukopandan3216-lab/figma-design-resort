// ===== START CUT: components/sections/Contact.jsx =====
function ContactSection() {
  const { bg, surface, text, text2, border } = useTheme()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const infoItems = [
    { icon: <IMapPin />, label: 'Address', value: 'Palawan Island, Philippines\nEl Nido, Palawan 5313' },
    { icon: <IPhoneOutline />, label: 'Phone', value: '+63 917 123 4567\n+63 928 765 4321' },
    { icon: <IEnvelope />, label: 'Email', value: 'reservations@palawanparaiso.com\nhello@palawanparaiso.com' },
    { icon: <IClock />, label: 'Business Hours', value: 'Monday – Sunday\n7:00 AM – 10:00 PM' },
  ]

  return (
    <section id="contact" className="py-20 lg:py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Get in Touch</p>
          <h2 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Contact Us</h2>
          <p className="text-sm mt-3 max-w-xl mx-auto leading-relaxed" style={{ color: text2 }}>{"We'd love to hear from you. Reach out to us for reservations, inquiries, or just to say hello."}</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="text-white rounded-full flex items-center justify-center mb-4 shadow-md" style={{ width: 56, height: 56, background: GREEN }}><Chk cls="w-7 h-7" /></div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Message Sent!</h3>
                <p className="text-sm" style={{ color: text2 }}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-5 text-sm font-medium underline" style={{ color: GREEN }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Full Name *</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="Maria Santos" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Email Address *</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="maria@email.com" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Phone Number</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Subject *</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="Reservation Inquiry" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></div>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Message *</label><textarea className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400 resize-none" style={icStyle(surface, text)} placeholder="Tell us about your inquiry..." rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required /></div>
                <button type="submit" className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2" style={{ background: GREEN }}>Send Message <IArrowRight /></button>
              </form>
            )}
          </div>
          <div className="space-y-5">
            {infoItems.map(item => (
              <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: surface }}>
                <div className="mt-0.5 shrink-0" style={{ color: GREEN }}>{item.icon}</div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: text }}>{item.label}</p>
                  {item.value.split('\n').map((line, i) => <p key={i} className="text-xs" style={{ color: text2 }}>{line}</p>)}
                </div>
              </div>
            ))}
            <div className="rounded-xl overflow-hidden" style={{ height: 180, background: '#E8F0EB', position: 'relative' }}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #38875C 0, #38875C 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #38875C 0, #38875C 1px, transparent 1px, transparent 32px)' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="text-white rounded-full flex items-center justify-center shadow-lg" style={{ width: 40, height: 40, background: GREEN }}><IMapPin /></div>
                <div className="text-center px-4 py-2 rounded-lg bg-white/90 shadow-sm">
                  <p className="text-xs font-semibold text-gray-800">Palawan Paraíso Resort &amp; Spa</p>
                  <p className="text-[10px] text-gray-500">El Nido, Palawan, Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}