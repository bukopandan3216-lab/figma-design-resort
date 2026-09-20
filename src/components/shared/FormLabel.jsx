// ===== START CUT: components/shared/FormComponents.jsx =====
function Chip({ label }) {
  return <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: '#FDE8E4', color: '#B85050' }}>{label}</span>
}
const ic = 'rounded-lg px-3 py-2 text-sm outline-none w-full placeholder-gray-400 transition-all'
const icSel = 'rounded-lg px-3 py-2 text-sm outline-none w-full transition-all'
// Apply these inline styles alongside ic/icSel classes
function icStyle(surface, text) {
  return { background: surface, color: text }
}

function FLabel({ label, req, helper, children }) {
  const { text2 } = useTheme()
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium" style={{ color: text2 }}>{label}{req && <span style={{ color: GREEN }}>*</span>}</label>
      {children}
      {helper && <p className="text-[10px] mt-0.5" style={{ color: text2 }}>{helper}</p>}
    </div>
  )
}

function DateInput({ label, value, onChange, minDate }) {
  const ref = useRef(null)
  const { surface, text, text2 } = useTheme()
  return (
    <FLabel label={label} req>
      <div className="relative cursor-pointer rounded-lg" style={{ background: surface }}>
        <span className="block px-3 py-2 text-sm pr-9" style={{ color: value ? text : text2 }}>{value ? fmt(value) : 'dd/mm/yyyy'}</span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><Cal /></span>
        <input ref={ref} type="date" value={value} min={minDate} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </FLabel>
  )
}