import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Album from './Album';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from './NotFound';
import Movie from './Movie';
import * as config from '../config.json';

export const baseUrl = config.baseUrl;

function Footer() {
  return (
    <Container maxWidth="md">
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Note
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Nous ne sommes affiliés à aucun cinéma.
          Ce site n'a pas de vocation commerciale, et a pour unique but de permettre
          de visualiser simplement les films diffusés dans les cinémas de proximité.
        </Typography>
      </Box>
    </Container>
  );
}

export default function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Album />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route path="*" element={<NotFound />} />
          </Routes >
        </BrowserRouter >
        <Footer />
      </Box>
    </Container >
  );
}
