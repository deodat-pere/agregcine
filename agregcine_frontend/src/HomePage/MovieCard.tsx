import { Card, Tooltip, CardMedia, CardContent, Box, Typography, Button, Modal } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { get_image } from "../utils";
import { MovieProps } from "./Album";
import MovieDescription from "./MovieDescription";

export default function MovieCard(Props: MovieProps): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [lineClamp, setLineClamp] = useState<number>(3);
    const cardRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    let navigate = useNavigate();

    const routeChange = () => {
        let path = `/movie/` + Props.id.toString();
        navigate(path);
    }

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
    }, [Props.summary]);

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
                    image={get_image(Props.image_link)}
                    href={"/movie/" + Props.id.toString()}
                    onClick={() => routeChange()
                    }
                />
            </Tooltip>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                <Box display={"flex"} flexDirection={"column"}>
                    <Typography gutterBottom variant="h5" component="h2">
                        {Props.name}
                    </Typography>
                    <Typography color="text.secondary">
                        {Props.runtime}
                    </Typography>
                    <Typography
                        ref={summaryRef}
                        sx={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: lineClamp,
                            backgroundcolor: "primary",
                            backgroundImage: `linear-gradient(180deg, #000000, #C0C0C0)`,
                            backgroundSize: "100%",
                            backgroundRepeat: "repeat",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",

                        }}><div dangerouslySetInnerHTML={{ __html: `${Props.summary}` }} />
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
                        <MovieDescription movie={Props} closePopup={setOpen} />
                    </Modal>
                </Box>
            </CardContent>
        </Card >
    );
}