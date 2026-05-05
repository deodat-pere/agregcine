import { Card, Tooltip, CardMedia, CardContent, Box, Typography, Button, Modal, IconButton } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { get_image } from "../utils";
import { MovieProps } from "./Album";
import MovieDescription from "./MovieDescription";
import { isFavorite, toggleFavorites } from '../localStorage';
import StarIcon from '@mui/icons-material/Star'; 
import StarBorderIcon from '@mui/icons-material/StarBorder'; 

export default function MovieCard({props, selectedProfile}: {props: MovieProps, selectedProfile: string}): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [lineClamp, setLineClamp] = useState<number>(3);
    const cardRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const navigate = useNavigate();
    const routeChange = () => {
        const path = '/movie/' + props.id.toString();
        navigate(path);
    }

    const [favorite, setFavoriteState] = useState<boolean>(isFavorite(selectedProfile, props.id));
    const toggleFav = () => {
        const newFav = !favorite;
        toggleFavorites(selectedProfile, props.id, !favorite);
        setFavoriteState(newFav);
    };

    useEffect(() => {
        const adjustLineClamp = () => {
            if (cardRef.current && summaryRef.current && buttonRef.current) {
                const summaryElement = summaryRef.current;
                const cardY = cardRef.current.getBoundingClientRect().y;
                const cardHeight = cardRef.current.offsetHeight;
                const sumaryY = summaryRef.current.getBoundingClientRect().y;
                const buttonHeight = buttonRef.current.offsetHeight;
                const availableHeight = cardHeight - (sumaryY - cardY) - buttonHeight - 32; // 32 is the sum of the paddings and margins

                const lineHeight = parseFloat(getComputedStyle(summaryElement).lineHeight);
                const maxLines = Math.floor(availableHeight / lineHeight);

                setLineClamp(maxLines);
            }
        };

        adjustLineClamp();
        window.addEventListener('resize', adjustLineClamp);
        window.addEventListener('click', adjustLineClamp);
        return () => {
            window.removeEventListener('resize', adjustLineClamp);
            window.removeEventListener('click', adjustLineClamp);
        }
    }, [props.summary]);

    return (
        <Card
            ref={cardRef}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Tooltip title="Voir les séances">
                <CardMedia
                    component="a"
                    sx={{
                        pt: '125%',
                        "&:hover": {
                            cursor: 'pointer',
                            boxShadow: 10,
                            transform: "scale(1.01)",
                        }
                    }}
                    image={get_image(props.image_link)}
                    href={"/movie/" + props.id.toString()}
                    onClick={() => routeChange()
                    }
                />
            </Tooltip>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                <Box display={"flex"} flexDirection={"column"}>
                     <Box display={"flex"} flexDirection={"row"} justifyContent={"flex-start"}>
                    <Typography gutterBottom variant="h5" component="h2">
                        {props.name}
                    </Typography>
                     <IconButton onClick={toggleFav} size="large">
                        {favorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                    </IconButton>
                    </Box>
                    <Typography color="text.secondary">
                        {props.runtime}
                    </Typography>
                    <Typography
                        ref={summaryRef}
                        sx={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: lineClamp,
                            overflow: 'hidden',
                            position: 'relative',
                            whiteSpace: 'normal',
                            color: 'transparent', // This makes the text take on the gradient color below
                            backgroundImage: `linear-gradient(180deg, #000000, #C0C0C0)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            maxHeight: "20vh",
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                height: '1.5em', // Adjust this height to control the fading effect
                                width: '100%',
                                background: `linear - gradient(to right, transparent, #fff)`, // Adjust to the background color of the card
                            }
                        }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: `${props.summary} ` }} />
                    </Typography>

                </Box>
                <Box
                    ref={buttonRef}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="flex-end"
                >
                    <Button size="small" onClick={() => setOpen(true)}>
                        Plus
                    </Button>
                    <Modal
                        open={open}
                        onClose={() => setOpen(false)}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <MovieDescription movie={props} closePopup={setOpen} selectedProfile={selectedProfile} setIsFavParent={toggleFav}/>
                    </Modal>
                </Box>
            </CardContent>
        </Card >
    );
}
