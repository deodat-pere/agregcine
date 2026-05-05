import Grid from '@mui/material/Grid2';
import { Container, Box } from '@mui/material';
import { DayedSeances, IDedSeance } from './TimelinePage';
import SeanceCard from './SeanceCard';
import { MovieProps } from '../HomePage/Album';
import { getProfile,isBookmarked,isFavorite } from '../localStorage'; 
import { useState } from 'react'; 
import TextField from '@mui/material/TextField'; 


export type TimelineProps = {
    dayFilterId: number,
    lgFilterId: number,
    seances: DayedSeances[],
    movies: Record<string, MovieProps>,
    selectedProfile: string,
}


export default function Timeline(props: TimelineProps) {
    const profile = getProfile(props.selectedProfile);
    const allowedCinemas = profile?.cinemas ?? [];

    const [search, setSearch] = useState(''); 

    const filters = [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_: IDedSeance) => (true),
    (seance: IDedSeance) => (!seance.seance.dubbed),
    (seance: IDedSeance) => (!seance.seance.subtitled),
    (seance: IDedSeance) => (isFavorite(props.selectedProfile,props.movies[seance.movie_id].id)),
    (seance: IDedSeance) => (isBookmarked(props.selectedProfile,seance))
    ];

    if (props.dayFilterId >= props.seances.length || !(props.movies)) {
        return (<></>)
    } else {
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
                <Grid container spacing={1.5} columns={{ xs: 4, sm: 8, md: 8 }}>
                    {props.seances[props.dayFilterId].seances
                        .sort((a, b) => (a.seance.time.localeCompare(b.seance.time)))
                        .filter(filters[props.lgFilterId])
                        .filter(seance => allowedCinemas.length > 0 ? allowedCinemas.includes(seance.seance.cine) : true)
                        .filter(seance => props.movies[seance.movie_id].name.toLowerCase().includes(search.toLowerCase()))
                        .map((seance: IDedSeance) => (
                            <Grid key={seance.seance.time + seance.seance.cine + seance.seance.dubbed + seance.movie_id} size={4}>
                                <SeanceCard seance={seance.seance} movie={props.movies[seance.movie_id]} selectedProfile={props.selectedProfile}/>
                            </Grid>
                        ))}
                </Grid>
            </Container>
        );
    }
}