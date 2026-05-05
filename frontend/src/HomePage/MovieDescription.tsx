import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MovieProps } from './Album';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder'; 
import { toggleFavorites, isFavorite } from '../localStorage'; 

export type MovieDescriptionProps = {
    movie: MovieProps,
    closePopup: React.Dispatch<React.SetStateAction<boolean>> | null,
    selectedProfile: string,
    setIsFavParent: React.Dispatch<React.SetStateAction<boolean>> | null,
}

export default function MovieDescription(props: MovieDescriptionProps) {
    const navigate = useNavigate();
    const routeChange = () => {
        const path = `/movie/` + props.movie.id.toString();
        navigate(path);
    }
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        setIsFav(isFavorite(props.selectedProfile, props.movie.id));
    }, [props.selectedProfile, props.movie.id]);

    useEffect(() => {
        const escFunction = (event: KeyboardEvent) => {
            if (event.key === "Escape" && props.closePopup) {
                props.closePopup(false)
            }
        };

        document.addEventListener("keydown", escFunction, false);

        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    })

    return (
        <Card sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '90%',
            marginBottom: 1,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", overflow: "auto" }} >
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Box display={"flex"} justifyItems={"flex-start"}>
                        <Typography variant="h5" component="h2" flexGrow={9}>
                            {props.movie.name}
                        </Typography>
                    </Box>
                    <Box flexGrow={1} display={"flex"} flexDirection={"row-reverse"}>
                        <IconButton
                            color="default" size="large"
                            onClick={() => {
                                if (props.closePopup) {
                                    props.closePopup(false)
                                }
                            }}>
                            <CloseIcon />
                        </IconButton>
                        <IconButton
                            color="warning" size="large"
                            onClick={() => {
                                toggleFavorites(props.selectedProfile, props.movie.id, !isFav);
                                setIsFav(prev => !prev);
                                if (props.setIsFavParent) {
                                    props.setIsFavParent(prev => !prev);
                                }
                            }}>
                            {isFav ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                    </Box>
                </Box>
                <Typography color="text.secondary">
                    {props.movie.runtime} - {props.movie.rating / 10}/5⭐
                </Typography>
                <Box>
                    {props.movie.genres.map((cat: string) => (
                        <Chip label={cat} sx={{ mt: 1, marginRight: 1 }} />
                    ))}
                </Box>
                <Typography> <div dangerouslySetInnerHTML={{ __html: props.movie.summary }} /> </Typography>

                <Box display="flex" flexDirection='row-reverse'>
                    <Button size="small" onClick={() => routeChange()}>
                        Voir les séances
                    </Button>
                </Box>
            </CardContent>
        </Card >
    );
}