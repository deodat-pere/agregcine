import Grid from '@mui/material/Grid2';
import Container from '@mui/material/Container';
import MovieCard from './MovieCard';
import { getMovies } from '../structTransform';




export type MovieProps = {
    id: number;
    runtime: string,
    name: string;
    summary: string;
    image_link: string;
    release_date: string;
    is_new: boolean,
    is_premiere: boolean,
    is_unique: boolean,
    rating: number,
    genres: Array<string>
}

export type AlbumProps = {
    filterId: number,
}

const filters = [
    (_: MovieProps) => (true),
    (movie: MovieProps) => (movie.is_new),
    (movie: MovieProps) => (movie.is_unique),
    (movie: MovieProps) => (movie.is_premiere),
]

export default function Album(props: AlbumProps) {
    const movies = getMovies();

    return (
        <Container sx={{ py: 8 }} maxWidth="md">
            <Grid container spacing={1.5} columns={{ xs: 4, sm: 8, md: 12 }}>
                {movies.filter(filters[props.filterId]).sort((a, b) => (a.name.localeCompare(b.name))).map((movie: MovieProps) => (
                    <Grid key={movie.id} size={4}>
                        <MovieCard {...movie} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}