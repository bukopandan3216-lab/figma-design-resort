// ===== START CUT: components/booking/NavFooter.jsx =====
function NavFooter({ step, total, onBack, onNext, nextLabel = 'Continue', disableBack = false }) {
  const { border, text2, text3 } = useTheme()
  return (
    <div className="flex items-center justify-between px-4 py-3 shrink-0 border-t" style={{ borderColor: border }}>
      <button onClick={onBack} disabled={disableBack} className="flex items-center gap-1 px-3.5 py-1.5 text-xs rounded-full font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: text2, border: `1px solid ${border}` }}>
        <ChevL /> Back
      </button>
      <span className="text-[11px] font-medium" style={{ color: text3 }}>Step {step} of {total}</span>
      <button onClick={onNext} className="flex items-center gap-1 px-4 py-1.5 text-xs text-white rounded-full font-medium hover:opacity-90 transition-opacity" style={{ background: GREEN }}>
        {nextLabel} <ChevR />
      </button>
    </div>
  )
}
