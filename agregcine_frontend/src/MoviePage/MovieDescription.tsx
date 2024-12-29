import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MovieProps } from '../HomePage/Album';
import { get_image } from '../utils';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';

export type MovieDescriptionProps = {
    movie: MovieProps,
}

export default function MovieDescription(props: MovieDescriptionProps) {

    const [timeAndStars, setTimeAndStars] = useState<string>("");

    useEffect(() => {
        if (props.movie.id == -1) {
            setTimeAndStars("")
        } else {
            setTimeAndStars(props.movie.runtime + " - " + props.movie.rating / 10 + "/5⭐")
        }
    }, [props]);

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                width: 'lg',
                paddingRight: { sx: 0, sm: 2 },
                paddingLeft: { sx: 2, sm: 0 },
            }}
        >
            <Card
                sx={{ width: { xs: '90%', sm: '20%' }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
                <CardMedia
                    component="div"
                    sx={{
                        // 16:9
                        pt: '125%',
                        display: "flex"
                    }}
                    image={get_image(props.movie.image_link)}
                />
            </Card>
            <Card
                sx={{ width: { xs: '90%', sm: '80%' }, display: 'flex', flexDirection: 'column' }}
            >
                <CardContent sx={{ display: "flex", flexDirection: "column" }}>
                    <Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Typography gutterBottom variant="h5" component="h2" flexGrow={9}>
                                {props.movie.name}
                            </Typography>
                        </Box>
                        <Box>

                            <Typography color="text.secondary">
                                {timeAndStars}
                            </Typography>
                            <Box>
                                {props.movie.genres.map((cat: string) => (
                                    <Chip label={cat} sx={{ mt: 1, marginRight: 1 }} />
                                ))}
                            </Box>
                            <Typography> <div dangerouslySetInnerHTML={{ __html: props.movie.summary }} /> </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card >
        </Box>
    );
}