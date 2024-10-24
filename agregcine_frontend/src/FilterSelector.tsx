import Box from '@mui/material/Box';
import { Button, Paper } from '@mui/material';
import { MovieProps } from './Album';

export type FilterSelectorProps = {
    id: number,
    setId: React.Dispatch<React.SetStateAction<number>>
}

export function noFilter(_v: MovieProps, _i: number, _a: MovieProps[]): boolean { return true }

const ClickedSx = {
    marginLeft: 2,
    border: "1px solid",
    cursor: "pointer",
    borderColor: "text.primary",
    transform: "scale(1.05)"
}

function get_button_style(selected: number, id: number): any {
    if (selected == id) {
        return ClickedSx
    } else {
        const style = {
            marginLeft: 2,
            border: "1px solid",
            borderColor: "text.secondary",
            "&:hover": ClickedSx,
        }
        return style
    }
}

export function FilterSelector(props: FilterSelectorProps): JSX.Element {
    const options = ["Tous les films", "Sorties de la semaine", "Diffusions uniques", "Avant premières"];
    const opt_len = options.length;

    function handleClick(id: number) {
        props.setId(id)
    }

    return (
        <Box display={"flex"} flexDirection={"row"} width="lg" justifyContent={"center"}>
            {Array.from(Array(opt_len).keys()).map((id: number) => (
                <Paper sx={get_button_style(props.id, id)}>
                    <Button sx={{
                        color: "text.primary"
                    }}
                        onClick={() => handleClick(id)}>
                        {options[id]}
                    </Button>
                </Paper>
            ))
            }
        </Box >
    )

}