import * as React from "react";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Typography,
  DialogTitle,
  IconButton,
  DialogContent,
} from "@mui/material";
import { formattedLog } from '../ReportConsole';

interface DialogProps {
  open: boolean;
  logList: string[];
  setOpen: (open: boolean) => void;
}

export function ReportDialog(props: DialogProps) {
  const { open, setOpen, logList } = props;
  const [fullWidth, setFullWidth] = React.useState(true);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <React.Fragment>
      <Dialog
        fullWidth={fullWidth}
        maxWidth="lg"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} className="text-[#000]">
          {"Metafier Report"}
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <div className="p-[10px] flex-1 text-[#000] h-[500px]">
            {logList.map((log: string, idx: number) => {
              return (
                <Typography key={idx} variant="body1" sx={{ fontSize: "16px" }}>
                  {formattedLog(log)}
                </Typography>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
