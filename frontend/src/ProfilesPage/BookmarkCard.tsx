import { Card, CardContent, Box, Typography, Chip,CardMedia,IconButton } from "@mui/material";
import { MovieProps } from "../HomePage/Album";
import { ShowingProps } from "../MoviePage/ShowingsList";
import { parse_hour, parse_date,get_image } from "../utils";
import { useEffect,
useState } from "react";
import { isBookmarked,toggleBookmark } from "../localStorage";
import { IDedSeance } from "../TimelinePage/TimelinePage";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

export type BookmarkCardProps = {
    movie: MovieProps;
    seance: ShowingProps;
    selectedProfile: string;
};

export default function BookmarkCard({ movie, seance, selectedProfile }: BookmarkCardProps) {
    const [ , datePretty] = parse_date(seance.time);
    const [bookmarked, setBookmarked] = useState<boolean>(false);

    useEffect(() => {
        if (selectedProfile) {
            setBookmarked(isBookmarked(selectedProfile, { movie_id: movie.id, seance: seance } as IDedSeance));
        }
    }, [selectedProfile, seance, movie]);
    
    function getTag(seance: ShowingProps) {
        if (seance.dubbed) {
            return "VF";
        } else {
            return "VO";
        }
    }
    
    return (
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
                >
                    <CardMedia
                        component="img"
                        image={get_image(movie.image_link)}
                        sx={{
                            maxWidth: '25%',
                            aspectRatio: 1,
                        }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Box display={"flex"} flexDirection={"column"} sx={{ flex: 1 }}>
                            <Typography variant="h5" component="h2">
                                {movie.name}
                            </Typography>
                            <Box display={"flex"} flexDirection={"row"}>
                                < Typography align="left" color="text.primary" paddingLeft={1} paddingRight={1}>
                                    {datePretty}
                                </Typography>
                                < Typography align="left" color="text.primary" paddingLeft={1} paddingRight={1}>
                                    {parse_hour(seance.time)}
                                </Typography>
                                <Chip label={getTag(seance)} size={"small"} variant={"outlined"} />
                            </Box>
                            <Box display={"flex"} flexDirection={"column-reverse"}>
                                < Typography align="left" color="text.secondary" paddingLeft={1} paddingRight={1}>
                                    {seance.cine} - {movie.runtime}
                                </Typography>
                            </Box>
                        </Box>
                        <Box display={"flex"} flexDirection={"column"} justifyItems={"flex-start"}>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(selectedProfile, { movie_id: movie.id, seance: seance }, !bookmarked);
                                    setBookmarked(!bookmarked);
                                }}
                                size="large"
                            >
                                {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                            </IconButton>
                        </Box>
                    </CardContent>
                </Card >
    );
}
