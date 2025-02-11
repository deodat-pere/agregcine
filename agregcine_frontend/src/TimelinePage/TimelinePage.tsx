import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import FilterSelector from './FilterSelector';
import { baseUrl } from '../App';
import { MovieProps } from '../HomePage/Album';
import { ShowingProps } from '../MoviePage/ShowingsList';
import Timeline from './Timeline';
import { parse_date, small_date } from '../utils';
import { Chip, Divider } from '@mui/material';

export type IDedSeance = {
    id: number,
    seance: ShowingProps,
}

export type DayedSeances = {
    day: string,
    seances: IDedSeance[]
}

export default function TimelinePage() {
    const [dayFilterId, setDayFilterId] = useState<number>(0);
    const [lgFilterId, setLgFilterId] = useState<number>(0);
    const languages = ["Toutes les séances", "Non doublées", "Sans sous-titres"];

    const [movies, setMovies] = useState<MovieProps[]>([]);

    const [seances, setSeances] = useState<DayedSeances[]>([]);
    const [days, setDays] = useState<string[]>([])

    useEffect(() => {
        const api = async () => {
            const data2 = await fetch(baseUrl + "movies", {
                method: "GET"
            });
            const jsonData2: MovieProps[] = await data2.json();
            const ordered = jsonData2.sort((a, b) => (a.id - b.id));
            setMovies(ordered);

            const data = await fetch(baseUrl + "all_times", {
                method: "GET"
            });
            const jsonData: IDedSeance[] = await data.json();

            let mappings: Map<string, IDedSeance[]> = new Map;

            jsonData.forEach((showing) => {
                const d: string[] = parse_date(showing.seance.time);

                let show_arr = mappings.get(d[0]);
                if (show_arr) {
                    show_arr.push(showing);
                    mappings.set(d[0], show_arr);
                } else {
                    mappings.set(d[0], [showing]);
                }
            });

            const days: string[] = Array.from(mappings.keys()).sort();

            var dayed_seances: DayedSeances[] = [];

            days.forEach((day) => {
                var show_arr = mappings.get(day);
                if (show_arr) {
                    const t: DayedSeances = {
                        day: day,
                        seances: show_arr,
                    }
                    dayed_seances.push(t)
                } else {
                    const t: DayedSeances = {
                        day: day,
                        seances: [],
                    }
                    dayed_seances.push(t)
                }
            });

            setDays(days.map((d: string) => small_date(d)));

            setSeances(dayed_seances);
        };

        api();
    }, []);

    return (
        <main>
            {/* Hero unit */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pt: 3,
                    pb: 6,
                }}
            >
                <Container >
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        color="text.primary"
                    >
                        Films par jour
                    </Typography>
                </Container>
            </Box>
            <FilterSelector id={dayFilterId} setId={setDayFilterId} options={days} />
            <Divider sx={{ marginTop: 1, display: { sm: "flex", md: "none" } }}>
                <Chip label="Filtres" size="small" />
            </Divider>
            <FilterSelector id={lgFilterId} setId={setLgFilterId} options={languages} />
            <Timeline dayFilterId={dayFilterId} lgFilterId={lgFilterId} seances={seances} movies={movies} />
        </main>
    );
}