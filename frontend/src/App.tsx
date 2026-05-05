import Box from '@mui/material/Box';
import HomePage from './HomePage/HomePage';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NotFound from './NotFound';
import MoviePage from './MoviePage/MoviePage';
import TimelinePage from './TimelinePage/TimelinePage';
import { AppBar, Button, Container, CssBaseline, IconButton, Menu, MenuItem, ThemeProvider, Toolbar, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import theme from './theme';
import ProfilesPage from './ProfilesPage/ProfilesPage';
import { getSelectedProfile, setSelectedProfile as setSelectedProfileLS, getAllProfiles, Profile } from './localStorage';
import { loadMovies } from './structTransform';


type MenuPage = {
  title: string,
  path: string,
}

const pages: MenuPage[] = [
  {
    title: 'Tous les films',
    path: "/all"
  },
  {
    title: 'Jour par jour',
    path: "/"
  },
  {
    title: 'Profils',
    path: "/profiles"
  }];

type TopBarProps = {
  selectedProfile: string;
  setSelectedProfile: React.Dispatch<React.SetStateAction<string>>;
};

function TopBar(props: TopBarProps) {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorElProfile(null);
  };

  const navigate = useNavigate();

  useEffect(() => {
    setProfiles(getAllProfiles());
  }, [props.selectedProfile]);

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
                <MenuItem key={page.title} onClick={(() => {
                  handleCloseNavMenu();
                  navigate(page.path)
                }
                )}>
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
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', ml: 2 }}>
            <Button
              color="inherit"
              onClick={handleOpenProfileMenu}
              endIcon={<PersonIcon />}
            >
              <Typography variant="subtitle1" color="inherit">
                {props.selectedProfile || '—'}
              </Typography>
            </Button>
            <Menu
              anchorEl={anchorElProfile}
              open={Boolean(anchorElProfile)}
              onClose={handleCloseProfileMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                key="empty"
                onClick={() => {
                  props.setSelectedProfile('');
                  handleCloseProfileMenu();
                }}
              >
                — (Pas de profil)
              </MenuItem>

              {profiles.map((p) => (
                <MenuItem
                  key={p.name}
                  onClick={() => {
                    props.setSelectedProfile(p.name);
                    handleCloseProfileMenu();
                  }}
                >
                  {p.name}
                </MenuItem>
              ))}
            </Menu>
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
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [moviesLoaded, setMoviesLoaded] = useState(false);
  const isFirstRender = useRef(true);

  // Load selected profile on mount
  useEffect(() => {
    const currProfile = getSelectedProfile();
    setSelectedProfile(currProfile ? currProfile : "");
  }, []);

  // Load movies from remote once
  useEffect(() => {
    loadMovies().then(() => setMoviesLoaded(true));
  }, []);

  // Persist selected profile after first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelectedProfileLS(selectedProfile);
  }, [selectedProfile]);

  // Render nothing until movies are loaded
  if (!moviesLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Chargement des films...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ my: { md: 0, lg: 2 }, maxWidth: 'lg' }} >
        <BrowserRouter>
          <TopBar selectedProfile={selectedProfile} setSelectedProfile={setSelectedProfile} />
          <Routes>
            <Route path="/" element={<TimelinePage selectedProfile={selectedProfile}/>} />
            <Route path="/all" element={<HomePage selectedProfile={selectedProfile}/>} />
            <Route path="/movie/:movie_id" element={<MoviePage selectedProfile={selectedProfile}/>} />
            <Route path="/profiles" element={<ProfilesPage
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}/>} />
            <Route path="*" element={<NotFound />} />
          </Routes >
        </BrowserRouter >
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
