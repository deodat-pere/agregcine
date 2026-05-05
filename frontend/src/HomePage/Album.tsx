import Grid from '@mui/material/Grid2';
import Container from '@mui/material/Container';
import MovieCard from './MovieCard';
import { getMovies } from '../structTransform';
import { getProfile,isFavorite } from '../localStorage';
import { useState } from 'react';
import TextField from '@mui/material/TextField'; 
import Box from '@mui/material/Box'; 

export type MovieProps = {
    id: string;
    runtime: string,
    name: string;
    summary: string;
    image_link: string;
    release_date: string;
    is_new: boolean,
    is_premiere: boolean,
    is_unique: boolean,
    rating: number,
    genres: string[]
    cinemas: string[]
}

export type AlbumProps = {
    filterId: number,
    selectedProfile: string,
}

export default function Album(props: AlbumProps) {
    const movies = getMovies();

    // Get cinemas for the selected profile
    const profileCinemas = props.selectedProfile
        ? getProfile(props.selectedProfile)?.cinemas ?? []
        : [];

    const filters = [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_: MovieProps) => (true),
        (movie: MovieProps) => (movie.is_new),
        (movie: MovieProps) => (movie.is_unique),
        (movie: MovieProps) => (movie.is_premiere),
        (movie: MovieProps) => (isFavorite(props.selectedProfile,movie.id))
    ]

    // Filter movies by profile cinemas if list is non‑empty
    const filteredMovies = profileCinemas.length > 0
        ? Object.values(movies).filter(movie => movie.cinemas.some(c => profileCinemas.includes(c)))
        : Object.values(movies);

    const [search, setSearch] = useState('');

    return (
        <Container sx={{ py: 8 }} maxWidth="md">
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Rechercher un film..."
                    variant="outlined"
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Box>
            <Grid container spacing={1.5} columns={{ xs: 4, sm: 8, md: 12 }}>
                {filteredMovies
                    .filter(filters[props.filterId])
                    .filter(movie => movie.name.toLowerCase().includes(search.toLowerCase()))
                    .sort((a, b) => (a.name.localeCompare(b.name)))
                    .map((movie: MovieProps) => (
                        <Grid key={movie.id} size={4}>
                            <MovieCard props={movie} selectedProfile={props.selectedProfile} />
                        </Grid>
                    ))}
            </Grid>
        </Container>
    );
}