import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HomePage from './HomePage/HomePage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from './NotFound';
import MoviePage from './MoviePage/MoviePage';
import * as config from '../config.json';

export const baseUrl = config.baseUrl;

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
    <Box sx={{ my: 4, maxWidth: 'lg' }} >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes >
      </BrowserRouter >
      <Footer />
    </Box>
  );
}
