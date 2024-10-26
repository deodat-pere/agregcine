import { Card, Tooltip, CardMedia, CardContent, Box, Typography, Button, Modal } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get_image } from "../utils";
import { MovieProps } from "./Album";
import MovieDescription from "./MovieDescription";

export default function MovieCard(Props: MovieProps): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    let navigate = useNavigate();
    var innerHtml: string;
    if (Props.summary.length > 0) { innerHtml = Props.summary.substring(0, 110).concat("...") } else { innerHtml = "" };
    const routeChange = () => {
        let path = `/movie/` + Props.id.toString();
        navigate(path);
    }

    return (
        <Card
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
                    <Typography sx={{
                        backgroundcolor: "primary",
                        backgroundImage: `linear-gradient(180deg, #000000, #C0C0C0)`,
                        backgroundSize: "100%",
                        backgroundRepeat: "repeat",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",

                    }}><div dangerouslySetInnerHTML={{ __html: `${innerHtml}` }} />
                    </Typography>
                </Box>
                <Box
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