import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { useState } from 'react';
import * as config from '../../config.json';
import FilterSelector from './FilterSelector';
import Album from './Album';



export default function HomePage() {
    const [filterId, setFilterId] = useState<number>(0);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <main>
                {/* Hero unit */}
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        pt: 8,
                        pb: 6,
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
                        <Typography variant="h5" align="center" color="text.secondary" paragraph>
                            {config.presentationText}
                        </Typography>
                    </Container>
                </Box>
                <FilterSelector id={filterId} setId={setFilterId} />
                <Album filterId={filterId} />
            </main>
        </ThemeProvider>
    );
}