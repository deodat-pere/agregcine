import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import FilterSelector from './FilterSelector';
import Album from './Album';
import { baseUrl } from '../App';



export default function HomePage() {
    const [filterId, setFilterId] = useState<number>(0);

    const [presentationText, setPresentationText] = useState<string>("");

    useEffect(() => {
        const api = async () => {
            const data = await fetch(baseUrl + "presentation_text", {
                method: "GET"
            });
            const jsonData = await data.json();
            setPresentationText(jsonData.presentation_text);
        };

        api();
    }, []);

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