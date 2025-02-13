import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useState } from 'react';
import FilterSelector from './FilterSelector';
import Album from './Album';



export default function HomePage() {
    const [filterId, setFilterId] = useState<number>(0);

    const presentationText = "Découvrez les films diffusés à Rennes cette semaine!";

    return (
        <main>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pb: 6,
                    pt: 3,
                }}
            >
                <Container >
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        color="text.primary"
                        gutterBottom
                    >
                        Films de la semaine
                    </Typography>
                    <Typography variant="h5" align="center" color="text.secondary">
                        {presentationText}
                    </Typography>
                </Container>
            </Box>
            <FilterSelector id={filterId} setId={setFilterId} />
            <Album filterId={filterId} />
        </main>
    );
}