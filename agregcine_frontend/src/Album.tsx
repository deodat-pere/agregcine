import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from './App';
import * as config from '../config.json';




export type MovieProps = {
    id: number;
    runtime: string,
    name: string;
    summary: string;
    image_link: string;
    release_date: string;
}

function MovieCard(Props: MovieProps): JSX.Element {
    const [showMore, setShowMore] = useState(false);

    let navigate = useNavigate();
    const routeChange = () => {
        let path = `/movie/` + Props.id.toString();
        navigate(path);
    }

    function get_image(image_link: string): string {
        if (image_link.length == 0) {
            return "https://fr.web.img3.acsta.net/r_600_849/commons/v9/common/empty/empty_portrait.png"
        } else {
            return image_link
        }
    }

    return (
        <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <CardMedia
                component="div"
                sx={{
                    // 16:9
                    pt: '125%',
                }}
                image={get_image(Props.image_link)}
                onClick={() => routeChange()}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                    {Props.name}
                </Typography>
                <Typography color="text.secondary">
                    {Props.runtime}
                </Typography>
                <Box>
                    {showMore ?
                        <Typography> <div dangerouslySetInnerHTML={{ __html: Props.summary }} /> </Typography> :
                        <Typography sx={{
                            backgroundcolor: "primary",
                            backgroundImage: `linear-gradient(180deg, #000000, #C0C0C0)`,
                            backgroundSize: "100%",
                            backgroundRepeat: "repeat",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}><div dangerouslySetInnerHTML={{ __html: `${Props.summary.substring(0, 110).concat("...")}` }} />
                        </Typography>}
                    <Box
                        //margin
                        display="flex"
                        justifyContent="flex-end"
                        alignItems="flex-end"
                    >
                        <Button size="small" onClick={() => setShowMore(!showMore)}>
                            {showMore ? "Réduire" : "Plus"}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
            <CardActions>
                <Button size="medium" onClick={() => routeChange()}>Voir les séances</Button>
            </CardActions>
        </Card>
    );
}


export default function Album() {
    const [movies, setMovies] = useState<MovieProps[]>([]);

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
                <Container sx={{ py: 8 }} maxWidth="md">
                    {/* End hero unit */}
                    <Grid container spacing={4} columns={12}>
                        {movies.sort((a, b) => (a.id - b.id)).map((movie: MovieProps) => (
                            <Grid item key={movie.id} xs={12} sm={6} md={4}>
                                <MovieCard id={movie.id} name={movie.name} image_link={movie.image_link}
                                    summary={movie.summary} release_date={movie.release_date} runtime={movie.runtime} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </main>
        </ThemeProvider>
    );
}