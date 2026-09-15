import { createTheme } from '@mui/material/styles'
import { heIL } from '@mui/material/locale'

export const colors = {
  ink: '#0E1F1C',
  background: '#F5F6F3',
  primary: '#0F6E5C',
  success: '#0F6E5C',
  warning: '#9A6B0E',
  error: '#943325',
  info: '#2C5B86',
  border: '#D9DEDA',
}

export const theme = createTheme(
  {
    direction: 'rtl',
    palette: {
      mode: 'light',
      background: {
        default: colors.background,
        paper: '#FFFFFF',
      },
      text: {
        primary: colors.ink,
      },
      primary: {
        main: colors.primary,
      },
      success: {
        main: colors.success,
      },
      warning: {
        main: colors.warning,
      },
      error: {
        main: colors.error,
      },
      info: {
        main: colors.info,
      },
      divider: colors.border,
    },
    shape: {
      borderRadius: 3,
    },
    typography: {
      fontFamily: '"Assistant", sans-serif',
      h1: { fontFamily: '"Frank Ruhl Libre", serif' },
      h2: { fontFamily: '"Frank Ruhl Libre", serif' },
      h3: { fontFamily: '"Frank Ruhl Libre", serif' },
      h4: { fontFamily: '"Frank Ruhl Libre", serif' },
      h5: { fontFamily: '"Frank Ruhl Libre", serif' },
      h6: { fontFamily: '"Frank Ruhl Libre", serif' },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.border}`,
            padding: '6px 12px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: `1px solid ${colors.border}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: `1px solid ${colors.border}`,
          },
        },
      },
    },
  },
  heIL,
)
