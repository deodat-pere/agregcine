import { Card, CardContent, Box, Typography, Chip, Tooltip, Modal, CardMedia, IconButton } from "@mui/material";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useEffect, useState } from "react";
import { isBookmarked, toggleBookmark } from "../localStorage";
import { ShowingProps } from "../MoviePage/ShowingsList";
import { MovieProps } from "../HomePage/Album";
import MovieDescription from "../HomePage/MovieDescription";
import { get_image, parse_hour } from "../utils";
import { IDedSeance } from "./TimelinePage";

export type SeanceCardProps = {
    seance: ShowingProps,
    movie: MovieProps,
    selectedProfile: string,
}

export default function SeanceCard(props: SeanceCardProps): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [bookmarked, setBookmarked] = useState<boolean>(false);

    function get_tag(seance: SeanceCardProps) {
        if (seance.seance.dubbed) {
            return "VF"
        } else {
            return "VO"
        }
    }

    useEffect(() => {
        if (props.selectedProfile) {
            setBookmarked(isBookmarked(props.selectedProfile, { movie_id: props.movie.id, seance: props.seance } as IDedSeance));
        }
    }, [props.selectedProfile, props.seance, props.movie]);

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
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Box display={"flex"} flexDirection={"column"} sx={{ flex: 1 }}>
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
                        <Box display={"flex"} flexDirection={"column"} justifyItems={"flex-start"}>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(props.selectedProfile, { movie_id: props.movie.id, seance: props.seance }, !bookmarked);
                                    setBookmarked(!bookmarked);
                                }}
                                size="large"
                            >
                                {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                            </IconButton>
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
                <MovieDescription movie={props.movie} closePopup={setOpen} selectedProfile={props.selectedProfile} setIsFavParent={null}/>
            </Modal>
        </>
    );
}
