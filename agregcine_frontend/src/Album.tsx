import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import Modal from '@mui/material/Modal';
import theme from './theme';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from './App';
import * as config from '../config.json';
import { get_image } from './utils';
import { MovieDescription } from './MovieDescription';
import Tooltip from '@mui/material/Tooltip';
import { FilterSelector } from './FilterSelector';




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
}

function MovieCard(Props: MovieProps): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    let navigate = useNavigate();
    var innerHtml: string;
    if (Props.summary.length > 0) { innerHtml = Props.summary.substring(0, 110).concat("...") } else { innerHtml = "" };
    const routeChange = () => {
        let path = `/movie/` + Props.id.toString();
        navigate(path);
    }

    return (
        <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Tooltip title="Voir les séances">
                <CardMedia
                    component="a"
                    sx={{
                        pt: '125%',
                        "&:hover": {
                            cursor: 'pointer',
                            boxShadow: 10,
                            transform: "scale(1.01)",
                        }
                    }}
                    image={get_image(Props.image_link)}
                    href={"/movie/" + Props.id.toString()}
                    onClick={() => routeChange()
                    }
                />
            </Tooltip>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                <Box display={"flex"} flexDirection={"column"}>
                    <Typography gutterBottom variant="h5" component="h2">
                        {Props.name}
                    </Typography>
                    <Typography color="text.secondary">
                        {Props.runtime}
                    </Typography>
                    <Typography sx={{
                        backgroundcolor: "primary",
                        backgroundImage: `linear-gradient(180deg, #000000, #C0C0C0)`,
                        backgroundSize: "100%",
                        backgroundRepeat: "repeat",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",

                    }}><div dangerouslySetInnerHTML={{ __html: `${innerHtml}` }} />
                    </Typography>
                </Box>
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="flex-end"
                >
                    <Button size="small" onClick={() => setOpen(true)}>
                        Plus
                    </Button>
                    <Modal
                        open={open}
                        onClose={() => setOpen(false)}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Card sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            marginBottom: 1,
                            boxShadow: 24,
                        }}>
                            <MovieDescription isPopup={true} movie={Props} closePopup={setOpen} />
                        </Card>
                    </Modal>

                </Box>
            </CardContent>
        </Card >
    );
}


const filters = [
    (_: MovieProps) => (true),
    (movie: MovieProps) => (movie.is_new),
    (movie: MovieProps) => (movie.is_unique),
    (movie: MovieProps) => (movie.is_premiere),
]

export function Album() {
    const [movies, setMovies] = useState<MovieProps[]>([]);
    const [filterId, setFilterId] = useState<number>(0);

    useEffect(() => {
        const api = async () => {
            const data = await fetch(baseUrl + "movies", {
                method: "GET"
            });
            const jsonData = await data.json();
            setMovies(jsonData);
        };

        api();
    }, []);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <main>
                {/* Hero unit */}
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        pt: 8,
                        pb: 6,
                    }}
                >
                    <Container maxWidth="sm">
                        <Typography
                            component="h1"
                            variant="h2"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            Films de la semaine
                        </Typography>
                        <Typography variant="h5" align="center" color="text.secondary" paragraph>
                            {config.presentationText}
                        </Typography>
                    </Container>
                </Box>
                <FilterSelector id={filterId} setId={setFilterId} />
                <Container sx={{ py: 8 }} maxWidth="md">
                    {/* End hero unit */}
                    <Grid container spacing={4} columns={12}>
                        {movies.filter(filters[filterId]).sort((a, b) => (a.id - b.id)).map((movie: MovieProps) => (
                            <Grid item key={movie.id} xs={12} sm={6} md={4}>
                                <MovieCard {...movie} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </main>
        </ThemeProvider>
    );
}