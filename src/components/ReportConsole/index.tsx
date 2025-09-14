import {useEffect, useState} from 'react';
import { Box, Typography, IconButton } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { ReportDialog } from "../index";

interface ReportConsoleProps {
  report?: string;
  sx?: string;
  fullscreen?: boolean;
  logs?: string;
  setFullScreen?: (fullscreen: boolean) => void;
}

export const formattedLog = (log: string) => {
  const indexList = [
    {text: 'ERROR', className: 'text-red-500'},
    {text: 'Error', className: 'text-red-500'},
    {text: 'WARNING', className: 'text-orange-500'},
    {text: 'Warning', className: 'text-orange-500'},
    {text: ' FAIL', className: 'text-red-500'},
    {text: ' PASS', className: 'text-green-500'}
  ]
  for (const idx of indexList) {
    const ind = log.indexOf(idx.text);
    if (ind >= 0) {
      return (
        <>
          <span>{log.slice(0, ind)}</span>
          <span className={idx.className}>{log.slice(ind, ind+idx.text.length)}</span>
          <span>{log.slice(ind+idx.text.length, -1)}</span>
        </>
      )
    }
  }
  return log;
}

export function ReportConsole(props: ReportConsoleProps) {
  const [ logList, setLogList ] = useState<string[]>([]);
  const { fullscreen, setFullScreen } = props;
  const {sx, logs} = props;
  useEffect(() => {
    if(logs) {
      const list = logs.split("\n");
      setLogList(list);
    } else setLogList([]);
  }, [logs])
  
  const handleFullScreen = () => {
    setFullScreen(true);
  };
  return (
    <Box className={`bg-[#11171d] rounded-md flex flex-col text-white ${sx}`}>
      <div className="flex justify-between bg-[#0F1214] px-[5px] py-[5px] rounded-t-md border-b-[1px] border-[#1d2126]">
        <Typography variant="body1">
          Metafier Report&nbsp;&nbsp;&nbsp;
          {/* <span className="text-[#ff0000]">Job</span>:4214733&nbsp;&nbsp; */}
          {/* <span className="text-red">Status</span>: Completed&nbsp;&nbsp; */}
          {/* <span className="text-white">version 5.2</span> */}
        </Typography>
        <Typography variant="body1">
          <IconButton size="small" color="inherit" onClick={handleFullScreen}>
            <FullscreenIcon fontSize="inherit" />
          </IconButton>
        </Typography>
      </div>
      <div className="p-[10px] flex-1 overflow-y-auto">
        {
          logList.map((log: string, idx: number) => {
            return <Typography key={idx} variant="body1" sx={{fontSize: '12px'}}>
                {formattedLog(log)}
              </Typography>
          })
        }
      </div>
      <ReportDialog logList={logList} open={fullscreen} setOpen={setFullScreen} />
    </Box>
  );
}
