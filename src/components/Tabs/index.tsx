import { styled, Tabs } from "@mui/material";
export const DolbyTabs = styled(Tabs)(() => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "#fff",
  },
  "&": {
    minHeight: "32px",
    position: "relative",
    top: "3px",
  },
  "& .MuiTab-root": {
    minHeight: "32px",
  },
}));
