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

export type MovieDescriptionProps = {
    movie: MovieProps,
    closePopup: React.Dispatch<React.SetStateAction<boolean>> | null,
}

export default function MovieDescription(props: MovieDescriptionProps) {
    let navigate = useNavigate();
    const routeChange = () => {
        let path = `/movie/` + props.movie.id.toString();
        navigate(path);
    }

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
                    <Typography gutterBottom variant="h5" component="h2" flexGrow={9}>
                        {props.movie.name}
                    </Typography>
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