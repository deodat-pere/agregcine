import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get_image, MovieProps } from './Album';
import NotFound from './NotFound';
import { IconButton } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import Divider from '@mui/material/Divider';
import { baseUrl } from './App';

type ShowingProps = {
    cine: string,
    time: string,
}

export default function MoviePage() {
    const { id } = useParams();
    const [isError, setIsError] = useState<boolean>(false);

    const [movie, setMovie] = useState<MovieProps>({
        name: "",
        runtime: "",
        summary: "",
        image_link: "",
        release_date: "",
        id: Number(id),
    });

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
                    setMovie({
                        name: "",
                        runtime: "",
                        summary: "",
                        image_link: "",
                        release_date: "",
                        id: 1,
                    });
                    setIsError(true);
                }
            }
        };

        api();
    }, []);
    if (!(isError && movie.id < 0)) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box width='100%'>
                    <IconButton color="default" size="large" onClick={() => routeChange()}>
                        <ArrowBackOutlinedIcon />
                    </IconButton>
                    <MovieCard {...movie} />
                    <Showings id={movie.id.toString()} />
                </Box>
            </ThemeProvider >
        );
    } else {
        return (
            <NotFound />
        );
    }

}

function MovieCard(movie: MovieProps) {

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                pt: 2,
                pb: 6,
                display: 'flex',
                flexDirection: 'row',
                width: 'lg'
            }}
        >
            <Card
                sx={{ width: '20%', display: 'flex', flexDirection: 'column' }}
            >
                <CardMedia
                    component="div"
                    sx={{
                        // 16:9
                        pt: '125%',
                    }}
                    image={get_image(movie.image_link)}
                />
            </Card>
            <Card
                sx={{ width: '80%', display: 'flex', flexDirection: 'column' }}
            >
                <CardContent >
                    <Typography gutterBottom variant="h5" component="h2">
                        {movie.name}
                    </Typography>
                    <Typography color="text.secondary">
                        {movie.runtime}
                    </Typography>

                    <Typography> <div dangerouslySetInnerHTML={{ __html: movie.summary }} /> </Typography>
                </CardContent>
            </Card >
        </Box>
    );
}


type ShowProps = {
    id: string
};

type PrettyShow = {
    cine: string,
    day: string,
    hour: string,
}

function Showings(Props: ShowProps) {
    const [showings, setShowings] = useState<ShowingProps[]>([]);

    useEffect(() => {
        const api = async () => {

            const data = await fetch(baseUrl + "showings/" + Props.id, {
                method: "GET"
            });
            if (data.ok) {
                const jsonData = await data.json();
                setShowings(jsonData);
            }

        };

        api();
    }, []);
    if (showings) {
        var days_arr: Set<string> = new Set;
        var mappings: Map<string, PrettyShow[]> = new Map;

        showings.forEach((showing) => {
            const d: string[] = parse_date(showing.time);

            var show_arr = mappings.get(d[0]);
            if (show_arr) {
                var pshow: PrettyShow = {
                    cine: showing.cine,
                    day: d[1],
                    hour: parse_hour(showing.time),
                };
                show_arr.push(pshow);
                mappings.set(d[0], show_arr);
            } else {
                days_arr.add(d[0]);
                var pshow: PrettyShow = {
                    cine: showing.cine,
                    day: d[1],
                    hour: parse_hour(showing.time),
                };
                mappings.set(d[0], [pshow]);
            }
        });

        var unique_day_arr: string[] = Array.from(days_arr.values());
        return (
            <div>
                < Typography variant="h4" align="left" color="text.primary" margin={2}>
                    Séances
                </Typography>
                <Container maxWidth="lg">
                    {unique_day_arr.sort().map((day: string) => (
                        <div>
                            <Divider orientation="horizontal" flexItem />
                            < Typography variant="h6" align="left" color="text.primary" margin={2}>
                                {parse_date(day)[1]}
                            </Typography>
                            <Box display="flex" >
                                {mappings.get(day)?.sort((a, b) => (a.hour < b.hour ? -1 : 1)).map((props: PrettyShow) => (
                                    <Box margin={1} marginBottom={3}>
                                        <Card>
                                            < Typography align="left" color="text.primary" paddingLeft={1} paddingRight={1}>
                                                {props.hour}
                                            </Typography>
                                            < Typography align="left" color="text.secondary" paddingLeft={1} paddingRight={1}>
                                                {props.cine}
                                            </Typography>
                                        </Card>
                                    </Box>
                                ))
                                }
                            </Box>
                        </div>
                    ))
                    }
                </Container >
            </div>
        );
    } else {
        return (<div></div>);
    }
}

function parse_date(s: string) {
    var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    var b = s.split(/\D+/);
    var date = new Date(Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2])));

    var date_pretty = jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()];
    return [date.toISOString(), date_pretty];
}

function parse_hour(s: string): string {
    return s.slice(11, 13) + "h" + s.slice(14, 16)
}  