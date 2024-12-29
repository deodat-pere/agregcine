import Grid from '@mui/material/Grid2';
import Container from '@mui/material/Container';
import { DayedSeances, IDedSeance } from './TimelinePage';
import SeanceCard from './SeanceCard';
import { MovieProps } from '../HomePage/Album';


export type TimelineProps = {
    dayFilterId: number,
    lgFilterId: number,
    seances: DayedSeances[],
    movies: MovieProps[],
}

export const filters = [
    (_: IDedSeance) => (true),
    (seance: IDedSeance) => (!seance.seance.dubbed),
    (seance: IDedSeance) => (!seance.seance.subtitled),
]


export default function Timeline(props: TimelineProps) {

    if (props.dayFilterId >= props.seances.length || !(props.movies)) {
        return (<></>)
    } else {
        return (
            <Container sx={{ py: 8 }} maxWidth="md">
                <Grid container spacing={1.5} columns={{ xs: 4, sm: 8, md: 8 }}>
                    {props.seances[props.dayFilterId].seances.sort((a, b) => (a.seance.time.localeCompare(b.seance.time))).filter(filters[props.lgFilterId]).map((seance: IDedSeance) => (
                        <Grid key={seance.seance.time + seance.seance.cine + seance.seance.dubbed + seance.id} size={4}>
                            <SeanceCard seance={seance.seance} movie={props.movies[seance.id]} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }
}