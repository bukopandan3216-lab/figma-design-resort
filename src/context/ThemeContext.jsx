// ===== START CUT: context/ThemeContext.jsx =====
const DarkCtx = createContext(false)
function useDark() { return useContext(DarkCtx) }
// Returns a set of theme-aware colors derived from the dark flag
function useTheme() {
  const dm = useDark()
  return {
    dm,
    bg: dm ? '#0C1810' : '#ffffff',
    surface: dm ? '#1D2E22' : '#F5F1E8',
    surface2: dm ? '#233628' : '#EDE8DD',
    card: dm ? '#162218' : '#ffffff',
    pageBg: dm ? '#0C1810' : '#F9FAFB',
    border: dm ? '#2A3E30' : '#E5E7EB',
    text: dm ? '#E8F0EA' : '#1B2E24',
    text2: dm ? '#8BAB96' : '#6B7280',
    text3: dm ? '#5E7D6A' : '#9CA3AF',
    navScrolled: dm ? '#0C1810' : '#ffffff',
    navScrolledShadow: dm ? '0 1px 16px rgba(0,0,0,0.4)' : '0 1px 16px rgba(0,0,0,0.08)',
  }
}