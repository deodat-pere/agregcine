import { Typography, Container, Divider, Box, Card, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { baseUrl } from "../App";
import { parse_date, parse_hour } from "../utils";

export type ShowingsListProps = {
    id: string
};

export type PrettyShow = {
    cine: string,
    day: string,
    hour: string,
    tag: string,
}

export type ShowingProps = {
    cine: string,
    time: string,
    dubbed: boolean,
    subtitled: boolean,
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
        let mappings: Map<string, PrettyShow[]> = new Map;

        showings.forEach((showing) => {
            var tag = "FR";
            if (showing.dubbed) {
                tag = "VF"
            } else if (showing.subtitled) {
                tag = "VOST"
            }
            const d: string[] = parse_date(showing.time);

            let show_arr = mappings.get(d[0]);
            if (show_arr) {
                let pshow: PrettyShow = {
                    cine: showing.cine,
                    day: d[1],
                    hour: parse_hour(showing.time),
                    tag: tag,
                };
                show_arr.push(pshow);
                mappings.set(d[0], show_arr);
            } else {
                let pshow: PrettyShow = {
                    cine: showing.cine,
                    day: d[1],
                    hour: parse_hour(showing.time),
                    tag: tag,
                };
                mappings.set(d[0], [pshow]);
            }
        });

        let unique_day_arr: string[] = Array.from(mappings.keys());
        return (
            <div>
                < Typography variant="h4" align="left" color="text.primary" margin={2}>
                    Séances
                </Typography>
                <Container maxWidth="lg">
                    {unique_day_arr.sort().map((day: string) => (
                        <div>
                            <Divider orientation="horizontal" flexItem />
                            < Typography variant="h6" align="left" color="text.primary" margin={1}>
                                {parse_date(day)[1]}
                            </Typography>
                            <Box display="flex" flexDirection={"row"} flexWrap={"wrap"}>
                                {mappings.get(day)?.sort((a, b) => (a.hour < b.hour ? -1 : 1)).map((props: PrettyShow) => (
                                    <Box display={"flex"} margin={1} marginBottom={3}>
                                        <Card sx={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                                            <Box display={"flex"} flexDirection={"row"} marginTop={1}>
                                                < Typography align="left" color="text.primary" paddingLeft={1} paddingRight={1}>
                                                    {props.hour}
                                                </Typography>
                                                {(props.tag == "FR") ? <></> : <Chip label={props.tag} size={"small"} variant={"outlined"} sx={{ marginRight: 1 }} />}
                                            </Box>
                                            <Box display={"flex"} flexDirection={"column-reverse"} marginBottom={1}>
                                                < Typography align="left" color="text.secondary" paddingLeft={1} paddingRight={1}>
                                                    {props.cine}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Box>
                                ))
                                }
                            </Box>
                        </div>
                    ))
                    }
                </Container >
            </div >
        );
    } else {
        return (<div></div>);
    }
}  