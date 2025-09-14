import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
const mockTestCriteria: { [key: string]: { text: string; state: number } } = {
  "Mastering Monitor": { text: "______", state: 0 },
  "Target Displays": { text: "______", state: 0 },
  "Color Encoding": { text: "______", state: 0 },
  "Overlapping Shots": { text: "______", state: 0 },
  "Gap Between Shots": { text: "______", state: 0 },
  "Negative Shot Duration": { text: "______", state: 0 },
  "Per-Frame Out-of-Range": { text: "______", state: 0 },
  "L1 Metadata": { text: "______", state: 0 },
  "L2 Metadata": { text: "______", state: 0 },
  "L3 Metadata": { text: "______", state: 0 },
  "L8 Metadata": { text: "______", state: 0 },
  "L9 Metadata": { text: "______", state: 0 },
  Errors: { text: "______", state: 0 },
  Warnings: { text: "______", state: 0 },
};
interface ValidationTestProps {
  logs?: string;
}
const ValidationTest = (props: ValidationTestProps) => {
  const [testResult, setTestResult] = useState<{ [key: string]: any }>(
    mockTestCriteria
  );

  useEffect(() => {
    if (props.logs === "pending") {
      const pendingLogs = { ...mockTestCriteria };
      Object.keys(mockTestCriteria).map((key: string) => {
        pendingLogs[key] = {
          text: "pending...",
          state: 0,
        };
      });
      setTestResult(pendingLogs);
    } else if (props.logs) {
      let newStates: { [key: string]: any } = {};
      const logs = props.logs.split("\n");
      let hasError = false,
        hasWarning = false;
      logs.forEach((log: string) => {
        if (log.indexOf("Validation Test:") >= 0) {
          const data = log.split("Test:")[1].trim();
          let state = 0;
          if (data === "PASS") state = 1;
          else if (data === "FAIL") state = -1;
          else state = 0;
          newStates[log.split("Test:")[0].trim()] = {
            text: data,
            state,
          };
        }
        if (log.indexOf("ERROR:") >= 0) {
          hasError = true;
          newStates["Errors"] = {
            text: "See Metafier Report",
            state: -1,
          };
        }
        if (log.indexOf("WARNING:") >= 0) {
          hasWarning = true;
          newStates["Warnings"] = {
            text: "See Metafier Report",
            state: -1,
          };
        }
      });
      if (!hasError) newStates["Errors"] = { text: "None", state: 1 };
      if (!hasWarning) newStates["Warnings"] = { text: "None", state: 1 };
      setTestResult(newStates);
    } else {
      setTestResult(mockTestCriteria);
    }
  }, [props.logs]);
  return (
    <div className="w-1/2 h-full flex flex-col">
      <Typography variant="h6" color="white">
        Validation Tests
      </Typography>
      <Box
        className="grow min-h-[300px] border-[1px] flex flex-col py-[4px] justify-center rounded
      text-[14px] xl:text-[14px] min-[1900px]:text-[18px]"
        sx={{ fontFamily: '"Roboto","Helvetica","Arial",sans-serif' }}
      >
        {Object.keys(testResult).map((key: string, idx: number) => (
          <Box key={idx} className="flex w-full text-white">
            <Box className="px-[8px] w-[300px] 2xl:w-[350px] text-right">
              <Typography variant="inherit">{key}</Typography>
            </Box>
            <Box className="px-[8px]">
              <Typography
                variant="inherit"
                sx={{
                  color:
                    testResult[key].state === 1
                      ? "#4caf50"
                      : testResult[key].state === -1
                      ? "#f44336"
                      : "#ffffff",
                }}
              >
                {testResult[key].text}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default ValidationTest;
