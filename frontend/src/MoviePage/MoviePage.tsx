import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { MovieProps } from '../HomePage/Album';
import NotFound from '../NotFound';
import MovieDescription from './MovieDescription';
import ShowingsList from './ShowingsList';
import { movieById } from '../structTransform';

export type MoviePageProps = {
  selectedProfile: string; 
};

export default function MoviePage({ selectedProfile }: MoviePageProps) {
  const { movie_id } = useParams();

  let movie: MovieProps | null = null;
  if (movie_id) {
    movie = movieById(movie_id);
  }

  if (movie && movie_id) {
    return (
      <Box display={'flex'} flexDirection={'column'} justifySelf={"center"} marginLeft={2} paddingTop={4}>
        <MovieDescription movie={movie} selectedProfile={selectedProfile} />
        <Box paddingTop={6}>
          <ShowingsList movie_id={movie_id} selectedProfile={selectedProfile} /> 
        </Box>
      </Box>
    );
  } else {
    return (
      <NotFound />
    );
  }
}
