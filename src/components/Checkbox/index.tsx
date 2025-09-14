import { styled, Checkbox } from "@mui/material";
export const DolbyCheckbox = styled(Checkbox)(({ theme }) => ({
  "&.MuiCheckbox-root": {
    color: "#fff",
    padding: '5px'
  },
}));
