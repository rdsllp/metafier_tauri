import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditSummary from "./EditSummary";
import OptionList from "./OptionList";
import { ReportConsole, DolbyCheckbox } from "../../components";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { extractSummaryInfo } from "../../shared/utils";
import { showNotification } from "../../redux/slices/notificationSlice";
import { channels, optionList, summaryKeys } from "../../shared/constants";

const emptyString = "______________";
const mockXML: any = {
  [summaryKeys.XML_VERSION]: {
    value: emptyString,
    type: 0,
  },
  [summaryKeys.LEVEL_254_CM_VERSION]: {
    value: emptyString,
    type: 0,
  },
  [summaryKeys.ASPECT_RATIO_CANVAS]: {
    value: 0,
    type: 1,
  },
  [summaryKeys.ASPECT_RATIO_IMAGE]: {
    value: 0,
    type: 1,
  },
  [summaryKeys.FRAME_RATE]: {
    value: 0,
    type: 3, // Autocomplete
    list: [
      { text: "23.98fps", value: "23.98" },
      { text: "24fps", value: "24.00" },
      { text: "29.97fps", value: "29.97" },
      { text: "30fps", value: "30.00" },
      { text: "59.94fps", value: "59.94" },
      { text: "60fps", value: "60.00" },
    ],
  },
  [summaryKeys.MASTERING_MONITOR]: {
    value: emptyString,
    type: 2,
    list: [
      { text: "4000-nit, P3/D65, ST.2084, Full", value: 7 },
      { text: "4000-nit, Rec. 2020, ST.2084, Full", value: 8 },
      { text: "1000-nit, P3/D65, ST.2084, Full", value: 20 },
      { text: "1000-nit, Rec. 2020, ST.2084, Full", value: 21 },
      { text: "2000-nit, P3/D65, ST.2084, Full", value: 30 },
      { text: "2000-nit, Rec. 2020, ST.2084, Full", value: 31 },
    ],
  },
  [summaryKeys.LEVEL_6_MAX_FALL]: {
    value: 0,
    type: 1,
  },
  [summaryKeys.LEVEL_6_MAX_CLL]: {
    value: 0,
    type: 1,
  },
  [summaryKeys.COLOR_PRIMARIES]: {
    value: emptyString,
    type: 2,
    list: [
      { text: "p3d65", value: "p3d65" },
      { text: "bt2020", value: "bt2020" },
    ],
  },
  [summaryKeys.WHITE_POINT]: {
    value: emptyString,
    type: 0,
  },
  [summaryKeys.COLOR_SPACE]: {
    value: emptyString,
    type: 0,
  },
  [summaryKeys.EOTF]: {
    value: emptyString,
    type: 0,
  },
  [summaryKeys.SIGNAL_RANGE]: {
    value: emptyString,
    type: 0,
  },
  image_input_value: {
    value: 0,
  },
};

export const Edit = () => {
  const [dlgOpen, setDlgOpen] = useState<boolean>(false);
  const [data, setData] = useState(mockXML);
  const [originData, setOriginData] = useState(mockXML);
  const [bRunValidation, setBRunValidation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [params, setParams] = useState({
    [optionList.UPDATE_CM29_METADATA]: false,
    [optionList.ADD_COMMENT]: false,
    [optionList.REMOVE_TRIM]: false,
    [optionList.INSERT_BLACK_HEAD]: false,
    [optionList.INSERT_BLACK_TAIL]: false,
    [optionList.START_FRAME]: false,
    [optionList.SAVE_VERSION]: false,
  });
  const [paramValues, setParamValues] = useState({
    [optionList.SAVE_VERSION]: "",
    [optionList.START_FRAME]: "",
    [optionList.ADD_COMMENT]: "",
    [optionList.INSERT_BLACK_HEAD]: "",
    [optionList.INSERT_BLACK_TAIL]: "",
    [optionList.REMOVE_TRIM]: "",
  });
  const [log, setLog] = useState("");
  const { xmlData, fileName, pageLoading } = useAppSelector(
    (state) => state.xml
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (xmlData) {
      setSummary();
    }
  }, [xmlData]);

  useEffect(() => {
    setLog("");
    setBRunValidation(false);
  }, [fileName]);

  const setSummary = () => {
    if (!xmlData) {
      dispatch(
        showNotification({ message: "No XML file loaded", type: "error" })
      );
      return;
    }
    const newXML = extractSummaryInfo(xmlData);
    const xmlDataKeys = Object.keys(newXML);
    const newData = xmlDataKeys.reduce((acc: any, key) => {
      const value = newXML[key];
      const type = mockXML[key]?.type || 0;
      const list = mockXML[key]?.list || [];
      acc[key] = { value, type, list };
      return acc;
    }, {});
    newData["image_input_value"] = { value: 0 };
    setData(newData);
    setOriginData(newData);
  };
  const checkIsSuccess = (output: string) => {
    let bSuccess = true;
    for (const line of output.split("\n")) {
      if (
        line.includes("Error") ||
        line.includes("ERROR") ||
        line.includes(": FAIL")
      ) {
        bSuccess = false;
        break;
      }
    }
    return bSuccess;
  };

  const handleSaveAsNewFile = async () => {
    if (!fileName) {
      dispatch(
        showNotification({ message: "No XML file loaded", type: "error" })
      );
      return;
    }
    let command: string[] = [];
    let bRatio = false,
      bMaxFallCll = false;
    Object.keys(data).forEach((key: string) => {
      if (data[key].value != originData[key].value) {
        if (
          (key === summaryKeys.ASPECT_RATIO_CANVAS ||
            key === summaryKeys.ASPECT_RATIO_IMAGE) &&
          !bRatio
        ) {
          bRatio = true;
          let value1 = data[summaryKeys.ASPECT_RATIO_CANVAS].value,
            value2 = data[summaryKeys.ASPECT_RATIO_IMAGE].value;
          if (key === summaryKeys.ASPECT_RATIO_IMAGE) {
            value2 = data[summaryKeys.ASPECT_RATIO_IMAGE].value;
          }
          command.push("--aspect-ratios");
          command.push(`${value1}`);
          command.push(`${value2}`);
        } else if (key === summaryKeys.FRAME_RATE) {
          let n = 0,
            d = 0;
          if (data[summaryKeys.FRAME_RATE].value == "23.98")
            (n = 24000), (d = 1001);
          else if (data[summaryKeys.FRAME_RATE].value == "24.00")
            (n = 24), (d = 1);
          else if (data[summaryKeys.FRAME_RATE].value == "29.97")
            (n = 30000), (d = 1001);
          else if (data[summaryKeys.FRAME_RATE].value == "30.00")
            (n = 30), (d = 1);
          else if (data[summaryKeys.FRAME_RATE].value == "59.94")
            (n = 60000), (d = 1001);
          else if (data[summaryKeys.FRAME_RATE].value == "60.00")
            (n = 60), (d = 1);
          command.push("-r");
          command.push(`${n}/${d}`);
        } else if (key === summaryKeys.MASTERING_MONITOR) {
          command.push("--reset-displays");
          command.push("--mastering-display");
          command.push(`${data[summaryKeys.MASTERING_MONITOR].value}`);
        } else if (
          (key === summaryKeys.LEVEL_6_MAX_CLL ||
            key === summaryKeys.LEVEL_6_MAX_FALL) &&
          !bMaxFallCll
        ) {
          bMaxFallCll = true;
          command.push("--max-fall-cll");
          command.push(`${data[summaryKeys.LEVEL_6_MAX_FALL].value}`);
          command.push(`${data[summaryKeys.LEVEL_6_MAX_CLL].value}`);
        } else if (key === summaryKeys.COLOR_PRIMARIES) {
          command.push("--color-encoding");
          command.push(`${data[summaryKeys.COLOR_PRIMARIES].value}`);
        }
      }
    });
    Object.keys(params).forEach((key: string) => {
      if (params[key]) {
        if (key === optionList.UPDATE_CM29_METADATA) {
          command.push("--update-cm29-metadata");
        } else if (key === optionList.SAVE_VERSION) {
          if (!paramValues[optionList.SAVE_VERSION]) {
            dispatch(
              showNotification({
                message: "Downgrade XML version value is incorrect",
                type: "error",
              })
            );
            return;
          }
          command.push("--save-version");
          command.push(`${paramValues[optionList.SAVE_VERSION]}`);
        } else if (key === optionList.START_FRAME) {
          if (!paramValues[optionList.START_FRAME]) {
            dispatch(
              showNotification({
                message: "Set start frame value is incorrect",
                type: "error",
              })
            );
            return;
          }
          command.push("--start");
          command.push(`${paramValues[optionList.START_FRAME]}`);
        } else if (key === optionList.INSERT_BLACK_HEAD) {
          if (!paramValues[optionList.INSERT_BLACK_HEAD]) {
            dispatch(
              showNotification({
                message: "Insert black head value is incorrect",
                type: "error",
              })
            );
            return;
          }
          command.push("--insert-black-head");
          command.push(`${paramValues[optionList.INSERT_BLACK_HEAD]}`);
        } else if (key === optionList.INSERT_BLACK_TAIL) {
          if (!paramValues[optionList.INSERT_BLACK_TAIL]) {
            dispatch(
              showNotification({
                message: "Insert black tail value is incorrect",
                type: "error",
              })
            );
            return;
          }
          command.push("--insert-black-tail");
          command.push(`${paramValues[optionList.INSERT_BLACK_TAIL]}`);
        } else if (key === optionList.REMOVE_TRIM) {
          command.push("--remove-trim");
          command.push(`${paramValues[optionList.REMOVE_TRIM]}`);
        } else if (key === optionList.ADD_COMMENT) {
          command.push("--comment");
          command.push(`${paramValues[optionList.ADD_COMMENT]}`);
        }
      }
    });
    if (!command) {
      dispatch(
        showNotification({ message: "No changes to validate", type: "error" })
      );
      return;
    }
    setLoading(true);
    let output = await window.electron.ipcRenderer.invoke(
      channels.FUNC_SAVE_AS_NEW_XML,
      command,
      bRunValidation
    );
    const success = checkIsSuccess(output);
    setLoading(false);
    if (bRunValidation) {
      if (output != null) {
        setLog(output);
      } else {
        dispatch(
          showNotification({ message: "Validation failed", type: "error" })
        );
      }
    } else {
      if (!success) {
        setLog(output);
        dispatch(
          showNotification({ message: "An error occured!", type: "error" })
        );
      }
    }
  };

  return (
    <>
      {pageLoading ? (
        <Box className="flex items-center justify-center h-[620px] w-full">
          <CircularProgress />
        </Box>
      ) : (
        <Box
          className="px-[20px] py-[5px]"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Stack
            direction="row"
            spacing={2}
            className="grow"
            sx={{ height: "calc(100vh - 130px)" }}
          >
            <EditSummary
              fileName={fileName}
              data={data}
              originData={originData}
              setData={setData}
            />
            <Stack sx={{ width: "50%" }}>
              <OptionList
                data={params}
                setData={setParams}
                optionValues={paramValues}
                setOptionValues={setParamValues}
              />
              <ReportConsole
                logs={log}
                fullscreen={dlgOpen}
                setFullScreen={setDlgOpen}
                sx="h-[45%] my-[10px]"
              />
            </Stack>
          </Stack>
          <Box className="flex justify-end my-[5px]">
            <div className="flex items-center justify-end mr-[10px]">
              <DolbyCheckbox
                size="small"
                value={bRunValidation}
                onChange={(e) => setBRunValidation(!bRunValidation)}
              />
              <Typography variant="body1" className="text-white">
                Run Validation after Export
              </Typography>
            </div>
            <Button
              variant="contained"
              size="small"
              sx={{ backgroundColor: "rgb(237, 99, 23)" }}
              disabled={loading || !fileName}
              loading={loading}
              loadingPosition="start"
              onClick={handleSaveAsNewFile}
            >
              Save as a New File
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};
