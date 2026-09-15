import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import '@fontsource/assistant/400.css'
import '@fontsource/assistant/600.css'
import '@fontsource/assistant/700.css'
import '@fontsource/frank-ruhl-libre/500.css'
import '@fontsource/frank-ruhl-libre/700.css'
import { rtlCache } from './rtlCache'
import { theme } from './theme'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>,
)
