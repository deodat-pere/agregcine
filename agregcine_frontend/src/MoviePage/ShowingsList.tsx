import { Typography, Container, Divider, Box, Card } from "@mui/material";
import { useEffect, useState } from "react";
import { baseUrl } from "../App";

type ShowingsListProps = {
    id: string
};

type PrettyShow = {
    cine: string,
    day: string,
    hour: string,
}

type ShowingProps = {
    cine: string,
    time: string,
}

export default function ShowingsList(Props: ShowingsListProps) {
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
        let days_arr: Set<string> = new Set;
        let mappings: Map<string, PrettyShow[]> = new Map;

        showings.forEach((showing) => {
            const d: string[] = parse_date(showing.time);

            let show_arr = mappings.get(d[0]);
            if (show_arr) {
                let pshow: PrettyShow = {
                    cine: showing.cine,
                    day: d[1],
                    hour: parse_hour(showing.time),
                };
                show_arr.push(pshow);
                mappings.set(d[0], show_arr);
            } else {
                days_arr.add(d[0]);
                let pshow: PrettyShow = {
                    cine: showing.cine,
                    day: d[1],
                    hour: parse_hour(showing.time),
                };
                mappings.set(d[0], [pshow]);
            }
        });

        let unique_day_arr: string[] = Array.from(days_arr.values());
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
                            <Box display="flex" flexDirection={"row"} flexWrap={"wrap"}>
                                {mappings.get(day)?.sort((a, b) => (a.hour < b.hour ? -1 : 1)).map((props: PrettyShow) => (
                                    <Box display={"flex"} margin={1} marginBottom={3}>
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
    let jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    let mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    let b = s.split(/\D+/);
    let date = new Date(Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2])));

    let date_pretty = jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()];
    return [date.toISOString(), date_pretty];
}

function parse_hour(s: string): string {
    return s.slice(11, 13) + "h" + s.slice(14, 16)
}  