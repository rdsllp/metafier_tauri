import { useRef } from "react";
import { createTheme, ThemeProvider, Snackbar, Alert } from "@mui/material";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Edit } from "./pages/Edit";
import { Header } from "./components/Header";
import { Footer } from "./components";
import { Validate } from "./pages/Validate";
import { useAppSelector, useAppDispatch } from "./redux/store";
import { hideNotification } from "./redux/slices/notificationSlice";

const theme = createTheme({
  palette: {
    text: {
      primary: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "rgba(255, 255, 255, 0.38)",
            color: "rgba(255, 255, 255, 0.68)",
          },
        },
      },
    },
  },
});
const App = () => {
  const validationRef = useRef(null);
  const dispatch = useAppDispatch();
  const { open, message, type } = useAppSelector((state) => state.notification);
  const handleClose = () => {
    dispatch(hideNotification());
  };
  const callValidate = () => {
    if (validationRef.current) {
      (validationRef.current as unknown as any).handleValidate();
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Header callValidate={callValidate} />
        <Routes>
          <Route path="/" element={<Validate ref={validationRef} />} />
          <Route path="/edit" element={<Edit />} />
        </Routes>
        <Footer />
      </Router>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        onClose={handleClose}
      >
        <Alert severity={type}>{message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
