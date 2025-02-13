import Box from '@mui/material/Box';
import { Button, Paper } from '@mui/material';

export type FilterSelectorProps = {
    id: number,
    setId: React.Dispatch<React.SetStateAction<number>>
    options: string[]
}

const ClickedSx = {
    marginLeft: 2,
    marginTop: 1,
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
            marginTop: 1,
            border: "1px solid",
            borderColor: "text.secondary",
            "&:hover": ClickedSx,
        }
        return style
    }
}

export function FilterSelector(props: FilterSelectorProps): JSX.Element {
    const opt_len = props.options.length;

    function handleClick(id: number) {
        props.setId(id)
    }

    return (
        <Box display={"flex"} flexDirection={"column"} justifyContent={"center"}>
            <Box display={"flex"} flexDirection={"row"} flexWrap={"wrap"} maxWidth="lg" justifyContent={"center"}>
                {Array.from(Array(opt_len).keys()).map((id: number) => (
                    <Paper sx={get_button_style(props.id, id)} key={id}>
                        <Button sx={{
                            color: "text.primary"
                        }}
                            onClick={() => handleClick(id)}>
                            {props.options[id]}
                        </Button>
                    </Paper>
                ))
                }
            </Box >
        </Box>
    )

}