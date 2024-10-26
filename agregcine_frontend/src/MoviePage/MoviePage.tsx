import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MovieProps } from '../HomePage/Album';
import NotFound from '../NotFound';
import { IconButton } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { baseUrl } from '../App';
import MovieDescription from './MovieDescription';
import { default_movie_props, not_found_movie_props } from '../utils';
import ShowingsList from './ShowingsList';

export default function MoviePage() {
    const { id } = useParams();
    const [isError, setIsError] = useState<boolean>(false);

    const [movie, setMovie] = useState<MovieProps>(default_movie_props);

    let navigate = useNavigate();
    const routeChange = () => {
        let path = `/`;
        navigate(path);
    }

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
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box display={'flex'} flexDirection={'column'} justifySelf={"center"} marginLeft={2}>
                    <Box paddingBottom={2}>
                        <IconButton color="default" size="large" onClick={() => routeChange()}>
                            <ArrowBackOutlinedIcon />
                        </IconButton>
                    </Box>
                    <MovieDescription movie={movie} />
                    <Box paddingTop={6}>
                        <ShowingsList id={id} />
                    </Box>
                </Box>
            </ThemeProvider >
        );
    } else {
        return (
            <NotFound />
        );
    }

}
