import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { MovieProps } from '../HomePage/Album';
import NotFound from '../NotFound';
import MovieDescription from './MovieDescription';
import ShowingsList from './ShowingsList';
import { movieById } from '../structTransform';

export default function MoviePage() {
    const { id } = useParams();

    var movie: MovieProps | null = null;
    if (id) {
        if (Number(id)) {
            movie = movieById(Number(id))
        }
    }

    if (movie && id) {
        return (
            <Box display={'flex'} flexDirection={'column'} justifySelf={"center"} marginLeft={2} paddingTop={4}>
                <MovieDescription movie={movie} />
                <Box paddingTop={6}>
                    <ShowingsList id={id} />
                </Box>
            </Box>
        );
    } else {
        return (
            <NotFound />
        );
    }

}
