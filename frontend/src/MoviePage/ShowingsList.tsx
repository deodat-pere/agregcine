import { Typography, Container, Divider, Box } from "@mui/material";
import { parse_date } from "../utils";
import { seanceById } from "../structTransform";
import { getProfile } from '../localStorage'; 
import ShowingCard from "./ShowingCard";

export type ShowingsListProps = {
    movie_id: string,
    selectedProfile: string, 
};

export type ShowingProps = {
    cine: string,
    time: string,
    dubbed: boolean,
    subtitled: boolean,
}

export default function ShowingsList(props: ShowingsListProps) {
    let showings: ShowingProps[] | null = null;

    if (props.movie_id) {
        showings = seanceById(props.movie_id)
    }

    const profileCinemas = props.selectedProfile
        ? getProfile(props.selectedProfile)?.cinemas ?? []
        : [];

    if (showings) {
        const filteredShowings = profileCinemas.length > 0
            ? showings.filter(s => profileCinemas.includes(s.cine))
            : showings;

        const mappings: Map<string, ShowingProps[]> = new Map;

        filteredShowings.forEach((showing) => {
            const d: string[] = parse_date(showing.time);

            const show_arr = mappings.get(d[0]);
            if (show_arr) {
                show_arr.push(showing);
                mappings.set(d[0], show_arr);
            } else {
                mappings.set(d[0], [showing]);
            }
        });

        const unique_day_arr: string[] = Array.from(mappings.keys());
        return (
            <div>
                < Typography variant="h4" align="left" color="text.primary" margin={2}>
                    Séances
                </Typography>
                <Container maxWidth="lg">
                    {unique_day_arr.sort().map((day: string) => (
                        <>
                            <Divider orientation="horizontal" flexItem />
                            < Typography variant="h6" align="left" color="text.primary" margin={1}>
                                {parse_date(day)[1]}
                            </Typography>
                            <Box display="flex" flexDirection={"row"} flexWrap={"wrap"}>
                                {mappings.get(day)?.sort((a, b) => (a.time < b.time ? -1 : 1)).map((showing: ShowingProps) => (
                                   <ShowingCard showing={showing} movieId={props.movie_id} selectedProfile={props.selectedProfile}/> 
                                ))
                                }
                            </Box>
                        </>
                    ))
                    }
                </Container >
            </div >
        );
    } else {
        return (<div></div>);
    }
}