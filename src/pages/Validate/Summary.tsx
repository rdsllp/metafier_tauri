import { useEffect, useState } from "react";
  import {Box, Tooltip, Typography } from "@mui/material";
import { useAppSelector } from "../../redux/store";
import { extractSummaryInfo } from "../../shared/utils";
import { MasteringDisplays } from "../../shared/constants";
import { summaryKeys } from "../../shared/constants";
const emptryString = "_____________";
const mockXML: { [key: string]: string } = {
  [summaryKeys.XML_VERSION]: emptryString,
  [summaryKeys.LEVEL_254_CM_VERSION]: emptryString,
  [summaryKeys.ASPECT_RATIO_CANVAS]: emptryString,
  [summaryKeys.ASPECT_RATIO_IMAGE]: emptryString,
  [summaryKeys.FRAME_RATE]: emptryString,
  [summaryKeys.MASTERING_MONITOR]: emptryString,
  [summaryKeys.LEVEL_6_MAX_FALL]: emptryString,
  [summaryKeys.LEVEL_6_MAX_CLL]: emptryString,
  [summaryKeys.COLOR_PRIMARIES]: emptryString,
  [summaryKeys.WHITE_POINT]: emptryString,
  [summaryKeys.COLOR_SPACE]: emptryString,
  [summaryKeys.EOTF]: emptryString,
  [summaryKeys.SIGNAL_RANGE]: emptryString,
};
const Summary = () => {
  const {xmlData, fileName} = useAppSelector((state) => state.xml);
  const [summaryInfo, setSummaryInfo] = useState<{ [key: string]: string | number }>({});
  useEffect(() => {
    setSummaryInfo(mockXML);
  }, []);
  useEffect(() => {
    if(xmlData) {
      const newXML = extractSummaryInfo(xmlData);
      if (!newXML) {
        //Show an alert of invalid xml
        return ;
      }
      setSummaryInfo(newXML);
    }
  }, [xmlData, fileName]);
  
  return (
    <Box className="m-[20px] w-[50%] flex flex-col justify-stretch">
      <div>
        <Typography variant="body2" component="span" fontSize="22px" color="white" className="pr-[20px]">
          Summary 
        </Typography>
        <Tooltip title={fileName} placement="top-end">
          <Typography variant="body2" component="span" fontSize="14px" color="rgb(102, 179, 255)" sx={{fontWeight: 900}}>
            {
              fileName.length > 0 &&
              " ( " +
              (fileName.length > 45 ? fileName.substring(0, 45) + "..." : fileName)
              + " )"
            }
          </Typography>
        </Tooltip>
      </div>
      <Box className="flex flex-col justify-center grow border-[1px] rounded border-gray-300 py-[10px] overflow-y-auto
        text-[14px] xl:text-[14px] min-[1900px]:text-[18px]" sx={{fontFamily: '"Roboto","Helvetica","Arial",sans-serif'}}>
        {Object.keys(summaryInfo).map((key: string, idx: number) => (
          <Box
            key={idx}
            className="flex w-full text-white "
          >
            <Box className="px-[8px] w-[250px] min-[1900px]:w-[300px] text-right">
              <Typography variant="inherit">{key}</Typography>
            </Box>
            <Box className="px-[8px]">
              {
                key === 'Mastering Monitor' && summaryInfo[key] !== emptryString ? 
                <Typography variant="inherit" >
                  {MasteringDisplays[summaryInfo[key] as string]} ID({summaryInfo[key]}) 
                </Typography>
                :
                <Typography variant="inherit">{summaryInfo[key]}</Typography>
              }
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Summary;
