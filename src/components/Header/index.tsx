import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "../../assets/logo_1.png";
import {
  setXmlData,
  setTrimList,
  setPageLoading,
} from "../../redux/slices/xmlSlice";
import { useAppDispatch } from "../../redux/store";
import { showNotification } from "../../redux/slices/notificationSlice";
import { TauriApi } from "../../shared/tauriApi";

const menus = [
  { text: "Validate", path: "/", value: "1" },
  { text: "Edit", path: "/edit", value: "2" },
];
interface HeaderProps {
  callValidate: () => void;
}
export const Header = (_props: HeaderProps) => {
  const [value, setValue] = useState<String>("1");
  const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null);
  const [isDefaultPath, setIsDefaultPath] = useState<boolean>(false);
  const [metaPath, setMetaPath] = useState<string>("");
  const location = useLocation();
  const dispatch = useAppDispatch();

  const init = async () => {
    try {
      const isDefaultPath = await TauriApi.checkDefaultPath();
      setIsDefaultPath(isDefaultPath);
      if (!isDefaultPath) {
        const path = await TauriApi.getMetafierPath();
        setMetaPath(path);
      }
    } catch (error) {
      console.error("Failed to initialize:", error);
    }
  };
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setValue("1");
    } else if (location.pathname === "/edit") {
      setValue("2");
    }
  }, [location]);
  const handleLoadXML = async () => {
    try {
      const result = await TauriApi.openXmlDialog();
      if (result) {
        handleXMLFile(result);
      }
    } catch (error) {
      console.error("Failed to open XML dialog:", error);
      dispatch(
        showNotification({
          message: "Failed to open file dialog",
          type: "error",
        })
      );
    }
  };
  const handleMetaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMetaClose = () => {
    setAnchorEl(null);
  };
  const handleMetaBrowseClick = async () => {
    try {
      const filePath = await TauriApi.setMetafierPathDialog();
      if (filePath) {
        setMetaPath(filePath);
      }
    } catch (error) {
      console.error("Failed to set metafier path:", error);
      dispatch(
        showNotification({
          message: "Failed to set metafier path",
          type: "error",
        })
      );
    }
  };
  const handleXMLFile = async (data: {
    file_name: string;
    file_path: string;
  }) => {
    dispatch(setPageLoading(true));
    try {
      const response = await TauriApi.getTrimList(data.file_path);
      if (response == null) {
        dispatch(
          showNotification({ message: "Invalid XML file", type: "error" })
        );
        return;
      }
      dispatch(setPageLoading(false));
      dispatch(setTrimList(response.trim_list));
      dispatchXmlData(response.xml_data, data.file_name);
    } catch (error) {
      dispatch(setPageLoading(false));
      console.error("Failed to process XML file:", error);
      dispatch(
        showNotification({
          message: "Failed to process XML file",
          type: "error",
        })
      );
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (file && (file.name.endsWith(".xml") || file.name.endsWith(".mxf"))) {
      // HTML5 drag and drop doesn't provide full file paths for security reasons
      // Show a helpful message directing users to use the file dialog instead
      dispatch(
        showNotification({
          message:
            "Please use the 'Load XML/MXF' button to select files. Drag and drop doesn't provide full file paths in web applications.",
          type: "info",
        })
      );
    } else {
      dispatch(
        showNotification({
          message: "Please drop only XML or MXF files",
          type: "error",
        })
      );
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const dispatchXmlData = (xmlData: any, fileName: string) => {
    let payload: any = {
      fileName: fileName,
      xmlData,
    };
    dispatch(setXmlData(payload));
  };

  return (
    <div className="header-bg h-[60px] p-[10px] border-b-[1px] border-gray-300">
      <div className="flex items-center justify-between">
        <img src={logo} className="h-[30px]" alt="logo" />

        <List disablePadding>
          <ListItem disablePadding sx={{ color: "white" }}>
            {menus.map((menu, idx) => (
              <Link to={menu.path} key={idx}>
                <ListItemButton
                  sx={{
                    textAlign: "center",
                    minWidth: "100px",
                    backgroundColor:
                      value == menu.value
                        ? menu.path === "/edit"
                          ? "rgb(237, 99, 23)"
                          : "rgb(59, 125, 35)"
                        : "rgb(88, 88, 89)",
                  }}
                >
                  {menu.path === "/edit" ? (
                    <ListItemText
                      primary={menu.text}
                      sx={{
                        color: "#FFF",
                      }}
                    />
                  ) : (
                    <ListItemText
                      primary={menu.text}
                      sx={{
                        color: "#FFF",
                      }}
                    />
                  )}
                </ListItemButton>
              </Link>
            ))}
          </ListItem>
        </List>
        <div className="flex">
          {!isDefaultPath && (
            <div
              className="text-white border-[1px] border-[#ffffff22] bg-[#00000011] py-[4px] px-[15px] rounded-md mx-[10px]
              cursor-pointer hover:bg-[#ffffff11]"
              onClick={handleMetaClick}
            >
              <Typography variant="body1">
                <InsertLinkIcon className="text-white" />
                Link to Metafier
              </Typography>
            </div>
          )}

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleMetaClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            sx={{
              "& .MuiPaper-root": {
                display: "flex",
                alignItems: "center",
                padding: "0px 5px",
              },
            }}
          >
            <TextField
              sx={{ "& .MuiInputBase-input": { color: "#000" } }}
              value={metaPath}
              size="small"
              variant="standard"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
            <IconButton color="primary" onClick={handleMetaBrowseClick}>
              <FilePresentIcon />
            </IconButton>
          </Popover>
          <Button
            variant="contained"
            className="float-right"
            onClick={handleLoadXML}
          >
            Load XML/MXF
          </Button>
          <div
            className="text-white border-[1px] border-[#ffffff22] bg-[#00000011] py-[4px] px-[15px] rounded-md mx-[10px]"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Typography variant="body1">
              <InsertLinkIcon className="text-white" />
              Drag and Drop an XML/MXF here
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
