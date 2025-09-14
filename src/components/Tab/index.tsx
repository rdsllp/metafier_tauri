import { styled, Tab } from "@mui/material";
export const DolbyTab = styled(Tab)(
    ({theme}) => ({
        color: 'rgba(255, 255, 255, 0.7)',
        '&.Mui-selected': {
            color: '#fff',
            backgroundColor: '#ffffff11'
        },
    })
)