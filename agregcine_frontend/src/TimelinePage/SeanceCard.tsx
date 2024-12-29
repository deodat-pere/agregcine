import { Card, CardContent, Box, Typography, Chip, Tooltip, Modal, CardMedia } from "@mui/material";
import { useState } from "react";
import { ShowingProps } from "../MoviePage/ShowingsList";
import { MovieProps } from "../HomePage/Album";
import MovieDescription from "../HomePage/MovieDescription";
import { get_image, parse_hour } from "../utils";

export type SeanceCardProps = {
    seance: ShowingProps,
    movie: MovieProps,
}

export default function SeanceCard(props: SeanceCardProps): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);

    function get_tag(seance: SeanceCardProps) {
        if (seance.seance.dubbed) {
            return "VF"
        } else if (seance.seance.subtitled) {
            return "VOST"
        } else {
            return "FR"
        }
    }

    return (
        <>
            <Tooltip title="Voir le film">
                <Card
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        "&:hover": {
                            cursor: 'pointer',
                            boxShadow: 10,
                            transform: "scale(1.01)",
                        }
                    }}
                    onClick={() => setOpen(true)}
                >
                    <CardMedia
                        component="img"
                        image={get_image(props.movie.image_link)}
                        sx={{
                            maxWidth: '25%',
                            aspectRatio: 1,
                        }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                        <Box display={"flex"} flexDirection={"column"}>
                            <Typography variant="h5" component="h2">
                                {props.movie.name}
                            </Typography>
                            <Box display={"flex"} flexDirection={"row"}>
                                < Typography align="left" color="text.primary" paddingLeft={1} paddingRight={1}>
                                    {parse_hour(props.seance.time)}
                                </Typography>
                                <Chip label={get_tag(props)} size={"small"} variant={"outlined"} />
                            </Box>
                            <Box display={"flex"} flexDirection={"column-reverse"}>
                                < Typography align="left" color="text.secondary" paddingLeft={1} paddingRight={1}>
                                    {props.seance.cine} - {props.movie.runtime}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card >
            </Tooltip>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <MovieDescription movie={props.movie} closePopup={setOpen} />
            </Modal>
        </>
    );
}
