import { forwardRef, useState, useEffect, useImperativeHandle } from "react";
import {
  Stack,
  Box,
  Button,
  Grid2,
  Typography,
  styled,
  CircularProgress,
} from "@mui/material";
import Summary from "./Summary";
import ValidationTest from "./ValidationTest";
import { channels } from "../../shared/constants";
import {
  DolbyCheckbox,
  DolbyMenuItem,
  DolbySelect,
  ReportConsole,
  DolbyTooltip,
} from "../../components";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { showNotification } from "../../redux/slices/notificationSlice";

export const Validate = forwardRef((props, ref) => {
  const [liftChecked, setLiftChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dlgOpen, setDlgOpen] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(0);
  const [validationLog, setValidationLog] = useState<string>("");
  const { fileName, pageLoading } = useAppSelector((state) => state.xml);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setValidationLog("");
  }, [fileName]);

  useImperativeHandle(ref, () => ({
    handleValidate,
  }));
  const handleExport = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (validationLog) {
      const result = await window.electron.ipcRenderer.invoke(
        channels.FUNC_EXPORT_LOGS,
        validationLog
      );
      if (result) {
        dispatch(
          showNotification({
            message: "Logs exported successfully",
            type: "success",
          })
        );
      }
    } else {
      // Show an alert of empty logs
      dispatch(
        showNotification({ message: "No result to export", type: "error" })
      );
    }
  };
  const handleValidate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setValidationLog("pending");
    setLoading(true);
    let type = 0; // 0 - withoutLift, 1 - withLift 0, 2 - withLift 0.025
    if (liftChecked && threshold === 0) {
      type = 1;
    } else if (liftChecked && threshold === 0.025) {
      type = 2;
    }
    const res = await window.electron.ipcRenderer.invoke(
      channels.FUNC_VALIDATE_XML,
      type
    );
    setValidationLog(res);

    setLoading(false);
  };

  return (
    <>
      {pageLoading ? (
        <Box className="flex items-center justify-center h-[620px] w-full">
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            height: "calc(100vh - 80px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="column"
            spacing={1}
            className="px-[20px] py-[5px] grow h-[90%]"
          >
            <Stack
              direction="row"
              spacing={2}
              className="items-stretch flex-1 h-[60%]"
            >
              <Summary />
              <ValidationTest logs={validationLog} />
            </Stack>
            <Stack className="flex-1 h-[40%]">
              <ReportConsole
                logs={validationLog}
                fullscreen={dlgOpen}
                setFullScreen={setDlgOpen}
                sx="h-full"
              />
            </Stack>
          </Stack>
          <Grid2 container spacing={2} className="px-[30px] my-[10px]">
            <Grid2 size={6}>
              <Box className="gap-[10px] flex items-center justify-end">
                <div
                  className={
                    "flex items-center gap-[10px] px-[10px] border-[white]" +
                    (liftChecked ? " border-[1px] " : "")
                  }
                >
                  <DolbyTooltip
                    title="Dolby recommends a maximum positive lift of 0.025 for letterboxed content (having blanking)"
                    placement="top-end"
                  >
                    <div className="flex items-center justify-end">
                      <DolbyCheckbox
                        size="small"
                        value={liftChecked}
                        onChange={(e) => setLiftChecked(!liftChecked)}
                      />
                      <Typography variant="body1" className="text-white">
                        Positive Lift Threshold
                      </Typography>
                    </div>
                  </DolbyTooltip>
                  <DolbySelect
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value as number)}
                    size="small"
                    disabled={!liftChecked}
                    sx={
                      liftChecked
                        ? { borderWidth: "1px" }
                        : { borderWidth: "0px" }
                    }
                  >
                    <DolbyMenuItem value={0.0}>0.00</DolbyMenuItem>
                    <DolbyMenuItem value={0.025}>0.025</DolbyMenuItem>
                  </DolbySelect>
                </div>

                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={loading || !fileName}
                  sx={{ backgroundColor: "rgb(112, 174, 91)" }}
                  loading={loading}
                  loadingPosition="start"
                  onClick={handleValidate}
                >
                  RUN VALIDATION
                </Button>
              </Box>
            </Grid2>
            <Grid2 size={6} className="flex justify-end gap-[10px]">
              <Button
                variant="contained"
                size="small"
                sx={{ backgroundColor: "rgb(237, 99, 23)" }}
                onClick={handleExport}
              >
                Export REPORT
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      )}
    </>
  );
});
