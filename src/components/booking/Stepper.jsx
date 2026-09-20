// ===== START CUT: components/booking/Stepper.jsx =====
function Stepper({ cur, steps }) {
  const { card, border, text3 } = useTheme()
  return (
    <div className="flex items-start px-3 py-3 shrink-0 border-b" style={{ borderColor: border }}>
      {steps.map((label, i) => {
        const done = cur > i + 1
        const active = cur === i + 1
        const total = steps.length
        return (
          <div key={i} className="flex-1 flex flex-col items-center relative">
            {i > 0 && <div className="absolute z-0 h-[2px]" style={{ top: 13, left: 0, right: '50%', background: cur > i ? GREEN : border }} />}
            {i < total - 1 && <div className="absolute z-0 h-[2px]" style={{ top: 13, left: '50%', right: 0, background: cur > i + 1 ? GREEN : border }} />}
            <div className="relative z-10 rounded-full flex items-center justify-center" style={{ width: 26, height: 26, background: done ? GREEN : card, border: done ? 'none' : `2px solid ${active ? GREEN : border}`, color: done ? 'white' : active ? GREEN : text3, fontSize: 11, fontWeight: 600 }}>
              {done ? <Chk cls="w-3 h-3" /> : i + 1}
            </div>
            <p className="mt-1 text-center leading-tight" style={{ fontSize: 8, color: done || active ? GREEN : text3, fontWeight: done || active ? 600 : 400, maxWidth: 46 }}>{label}</p>
          </div>
        )
      })}
    </div>
  )
}