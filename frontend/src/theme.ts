import { createTheme } from '@mui/material/styles';
import { grey, red } from '@mui/material/colors';

// Augment the palette to include an ochre color
declare module '@mui/material/styles' {
  interface Palette {
    toolbar: Palette['primary'];
  }

  interface PaletteOptions {
    toolbar?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    toolbar: true;
  }
}

declare module '@mui/material/Autocomplete' {
  interface AutocompletePropsColorOverrides {
    toolbar: true;
  }
}

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    toolbar : {
      main: grey[600],
      light: grey[400],
      dark: grey[800],
      contrastText: '#ffffff'
    }
  },
});

export default theme;
