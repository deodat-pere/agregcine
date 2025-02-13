import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HomePage from './HomePage/HomePage';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NotFound from './NotFound';
import MoviePage from './MoviePage/MoviePage';
import TimelinePage from './TimelinePage/TimelinePage';
import { AppBar, Button, Container, CssBaseline, IconButton, Menu, MenuItem, ThemeProvider, Toolbar } from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import theme from './theme';

type MenuPage = {
  title: string,
  path: string,
}

const pages: MenuPage[] = [
  {
    title: 'Tous les films',
    path: "/"
  },
  {
    title: 'Jour par jour',
    path: "/timeline"
  }];

function TopBar() {


  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const navigate = useNavigate();

  return (
    <AppBar position="static" color="toolbar">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={(() => navigate(page.path))}>
                  <Typography sx={{ textAlign: 'center' }}>{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                size='large'
                key={page.title}
                onClick={() => { navigate(page.path); setAnchorElNav(null); }}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  "&:hover": {
                    transform: "scale(1.02)",
                  }
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar >
  );
}

function Footer() {
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 6 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Note
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
      >
        Nous ne sommes affiliés à aucun cinéma.
        Ce site n'a pas de vocation commerciale, et a pour unique but de permettre
        de visualiser simplement les films diffusés dans les cinémas de proximité.
      </Typography>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ my: { md: 0, lg: 2 }, maxWidth: 'lg' }} >
        <BrowserRouter>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/movie/:id" element={<MoviePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes >
        </BrowserRouter >
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
