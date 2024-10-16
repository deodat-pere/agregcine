import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    let navigate = useNavigate();
    const routeChange = () => {
        let path = `/`;
        navigate(path);
    }
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
                    <Container maxWidth="sm">
                        <Typography
                            component="h1"
                            variant="h1"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            404
                        </Typography>
                        <Typography variant="h5" align="center" color="text.secondary" paragraph>
                            Cette page n'existe pas
                        </Typography>
                        <Box display="flex" justifyContent="center">
                            <Button size="small" onClick={() => routeChange()}>
                                {"Revenir à l'accueil"}
                            </Button>
                        </Box>
                    </Container>
                </Box>
            </main>
        </ThemeProvider>
    );
}