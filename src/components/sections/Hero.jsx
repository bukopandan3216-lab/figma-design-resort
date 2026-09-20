// ===== START CUT: components/sections/Hero.jsx =====
function HeroSection({ onBook }) {
  return (
    <section id="home" className="-mt-[58px] min-h-screen relative flex flex-col">
      <img src={BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 50%, rgba(27,46,36,0.55) 100%)' }} />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 pt-[58px]">
        <p className="text-[10px] sm:text-xs font-medium tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-4" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
        <p className="text-white/65 text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-8 sm:mb-10 font-light">Reserve your slice of paradise</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
          <button onClick={onBook} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-xl" style={{ background: GREEN }}>
            Book Now <IArrowRight />
          </button>
          <button onClick={() => scrollToSection('catalogue')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:bg-white/20" style={{ border: '1.5px solid rgba(255,255,255,0.6)' }}>
            Explore Catalogue
          </button>
        </div>
      </div>
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-1 text-white/50">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4 animate-bounce" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </section>
  )
}
