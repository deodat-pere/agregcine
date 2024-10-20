import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MovieProps } from './Album';
import { get_image } from './utils';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export type MovieDescriptionProps = {
    movie: MovieProps,
    isPopup: boolean,
    closePopup: React.Dispatch<React.SetStateAction<boolean>> | null,
}

export function MovieDescription(props: MovieDescriptionProps) {
    let navigate = useNavigate();
    const routeChange = () => {
        let path = `/movie/` + props.movie.id.toString();
        navigate(path);
    }

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'row',
                width: 'lg'
            }}
        >
            <Card
                sx={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
                <CardMedia
                    component="div"
                    sx={{
                        // 16:9
                        pt: '125%',
                    }}
                    image={get_image(props.movie.image_link)}
                />
            </Card>
            <Card
                sx={{ width: '80%', display: 'flex', flexDirection: 'column' }}
            >
                <CardContent >
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Typography gutterBottom variant="h5" component="h2" flexGrow={9}>
                            {props.movie.name}
                        </Typography>
                        <Box flexGrow={1} display={"flex"} flexDirection={"row-reverse"}>
                            {props.isPopup ?
                                <IconButton
                                    color="default" size="large"
                                    onClick={() => {
                                        if (props.closePopup) {
                                            props.closePopup(false)
                                        }
                                    }}>
                                    <CloseIcon />
                                </IconButton> : <a></a>
                            }


                        </Box>
                    </Box>
                    <Typography color="text.secondary">
                        {props.movie.runtime}
                    </Typography>

                    <Typography> <div dangerouslySetInnerHTML={{ __html: props.movie.summary }} /> </Typography>
                    {props.isPopup ? <Box display="flex" flexDirection='row-reverse' >
                        <Button size="small" onClick={() => routeChange()}>
                            Voir les séances
                        </Button>
                    </Box> : <div></div>}
                </CardContent>
            </Card >
        </Box>
    );
}