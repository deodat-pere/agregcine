import Box from '@mui/material/Box';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MovieProps } from '../HomePage/Album';
import NotFound from '../NotFound';
import { baseUrl } from '../App';
import MovieDescription from './MovieDescription';
import { not_found_movie_props } from '../utils';
import ShowingsList from './ShowingsList';

export default function MoviePage() {
    const { id } = useParams();
    const [isError, setIsError] = useState<boolean>(false);

    const [movie, setMovie] = useState<MovieProps>(not_found_movie_props);

    useEffect(() => {
        const api = async () => {
            if (id) {

                const data = await fetch(baseUrl + "movie/" + id, {
                    method: "GET"
                });
                if (data.ok) {
                    const jsonData = await data.json();
                    setMovie(jsonData);
                } else {
                    setMovie(not_found_movie_props);
                    setIsError(true);
                }
            }
        };

        api();
    }, []);
    if (!(isError && movie.id < 0) && id) {
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
