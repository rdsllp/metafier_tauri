import { styled, Select, MenuItem } from "@mui/material";

export const DolbySelect = styled(Select)(() => ({
  "&.Mui-disabled": {
    color: "rgba(255, 255, 255, 0.38)",
  },
  "&": {
    fontSize: "inherit",
  },
  "& .MuiSelect-select": {
    padding: "0 5px",
    fontSize: "inherit",
  },
  "&.Mui-disabled .MuiSelect-select": {
    textFillColor: "rgba(255, 255, 255, 0.38)",
    fontSize: "inherit",
  },
  "&.Mui-disabled .MuiSvgIcon-root": {
    color: "rgba(255, 255, 255, 0.38)",
  },
  "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.38)",
  },
  "& .MuiSvgIcon-root": {
    color: "white",
  },
}));
export const DolbyMenuItem = styled(MenuItem)(() => ({
  "&.MuiMenuItem-root": {
    color: "#000",
    zIndex: 1301,
  },
  "&.Mui-selected": {
    backgroundColor: "#fff",
    color: "#000",
  },
}));
