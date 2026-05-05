import { Box, Card, Chip, Typography, IconButton } from "@mui/material";
import { ShowingProps } from "./ShowingsList";
import { isBookmarked, toggleBookmark } from "../localStorage";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { parse_hour } from "../utils";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useState } from 'react';

export type ShowingCardProps = {
    showing: ShowingProps,
    movieId: string,
    selectedProfile: string,
}

export type PrettyShow = {
    cine: string,
    hour: string,
    tag: string,
}

export default function ShowingCard(props: ShowingCardProps) {
    const [bookmarked, setBookmarked] = useState<boolean>(isBookmarked(props.selectedProfile,{movie_id: props.movieId, seance: props.showing}));
    const pshow: PrettyShow = {
        cine: props.showing.cine,
        hour: parse_hour(props.showing.time),
        tag: props.showing.dubbed ? "VF" : "VO" 
    }
    return (
        <Box display={"flex"} margin={1} marginBottom={3}>
            <Card sx={{ display: "flex", justifyContent: "space-between", flexDirection: "row" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                    <Box display={"flex"} flexDirection={"row"} marginTop={1}>
                        < Typography align="left" color="text.primary" paddingLeft={1} paddingRight={1}>
                            {pshow.hour}
                        </Typography>
                        {(pshow.tag == "VF") ? <></> : <Chip label={pshow.tag} size={"small"} variant={"outlined"} sx={{ marginRight: 1 }} />}
                    </Box>
                    <Box display={"flex"} flexDirection={"column-reverse"} marginBottom={1}>
                        < Typography align="left" color="text.secondary" paddingLeft={1} paddingRight={1}>
                            {pshow.cine}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" justifyContent="flex-end" p={1}>
                    <IconButton
                        size="large"
                        aria-label="bookmark"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(props.selectedProfile, {movie_id: props.movieId, seance: props.showing}, !bookmarked);
                            setBookmarked((prev) => !prev)
                        }}
                    >
                        {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                    </IconButton>
                </Box>
            </Card>
        </Box>
    )
}