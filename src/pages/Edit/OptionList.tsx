import { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import {
  DolbyCheckbox,
  DolbyMenuItem,
  DolbySelect,
  DolbyTooltip,
} from "../../components";
import { optionList } from "../../shared/constants";
import { useAppSelector } from "../../redux/store";

interface OptionListProps {
  data: any;
  optionValues: any;
  setData: (data: any) => void;
  setOptionValues: (data: any) => void;
}

const xmlVerionList = ["2.0.5", "4.0.2", "5.1.0"];

const trimDescriptionList = {
  "1": "100-nit, BT.709, BT.1886, Full",
  "16": "48-nit, P3, D60, Gamma2.6, Full",
  "18": "48-nit, P3, DCI-white, Gamma2.6, Full",
  "21": "48-nit, P3, D65, Gamma2.6, Full",
  "27": "600-nit, P3, D65, ST.2084, Full",
  "28": "600-nit, BT.2020, ST.2084, Full",
  "37": "2000-nit, P3, D65, ST.2084, Full",
  "38": "2000-nit, BT.2020, D65, ST.2084, Full",
  "42": "108-nit, P3, D65, ST.2084, Full",
  "48": "1000-nit, P3, D65, ST.2084, Full",
  "49": "1000-nit, BT.2020, ST.2084, Full",
};

const OptionList = (props: OptionListProps) => {
  const { data, setData, optionValues, setOptionValues } = props;
  const { trimList, fileName } = useAppSelector((state) => state.xml);
  const [removeTrimList, setRemoveTrimList] = useState([]);
  useEffect(() => {
    let tempList: any = [];
    trimList?.L2.forEach((val) => {
      tempList.push({
        value: `L2,${val}`,
        text: `${trimDescriptionList[val]}`,
      });
    });
    trimList?.L8.forEach((val) => {
      tempList.push({
        value: `L8,${val}`,
        text: `${trimDescriptionList[val]}`,
      });
    });
    setRemoveTrimList(tempList);
  }, [trimList]);

  useEffect(() => {
    handleReset();
  }, [fileName]);

  const handleReset = () => {
    let tempData: any = {};
    Object.keys(data).forEach((key) => {
      tempData[key] = false;
    });
    setData(tempData);

    tempData = {};
    Object.keys(optionValues).forEach((key) => {
      tempData[key] = "";
    });
    setOptionValues(tempData);
  };
  const handleChange = (e: any, key: string) => {
    setData((prev: any) => ({
      ...prev,
      [key]: e.target.checked,
    }));
  };
  const handleValueChange = (e: any, key: string) => {
    setOptionValues((prev: any) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };
  return (
    <>
      <Typography variant="h6" color="white">
        Advanced
      </Typography>
      <div
        className="border-[1px] rounded p-[2px] h-[50%] relative text-[16px] 2xl:text-[20px] 2xl:leading-[2rem]
        min-[1900px]:text-[24px] min-[1900px]:leading-[2.5rem]
      "
        style={{ fontFamily: '"Roboto","Helvetica","Arial",sans-serif' }}
      >
        <div className="flex items-center gap-[5px]">
          <DolbyCheckbox
            size="small"
            checked={data[optionList.UPDATE_CM29_METADATA]}
            onChange={(e) => handleChange(e, optionList.UPDATE_CM29_METADATA)}
          />
          <Typography variant="inherit" className="text-white min-w-[200px]">
            Update backwards-compatible CMv2.9 metadata
          </Typography>
        </div>
        <div className="flex items-center gap-[5px]">
          <DolbyCheckbox
            size="small"
            checked={data[optionList.SAVE_VERSION]}
            onChange={(e) => handleChange(e, optionList.SAVE_VERSION)}
          />
          <Typography
            variant="inherit"
            className="text-white min-w-[200px] 2xl:min-w-[250px] min-[1900px]:min-w-[280px]"
          >
            Downgrade XML version
          </Typography>
          <DolbySelect
            disabled={!data[optionList.SAVE_VERSION]}
            className="bg-transparent border-[1px] my-[3px] px-[3px] rounded"
            value={optionValues[optionList.SAVE_VERSION]}
            onChange={(e) => handleValueChange(e, optionList.SAVE_VERSION)}
          >
            {xmlVerionList.map((item, index) => (
              <DolbyMenuItem key={index} value={item}>
                {item}
              </DolbyMenuItem>
            ))}
          </DolbySelect>
        </div>
        <div className="flex items-center gap-[5px]">
          <DolbyCheckbox
            size="small"
            checked={data[optionList.START_FRAME]}
            onChange={(e) => handleChange(e, optionList.START_FRAME)}
          />
          <Typography
            variant="inherit"
            className="text-white min-w-[200px] 2xl:min-w-[250px] min-[1900px]:min-w-[280px]"
          >
            Set start frame
          </Typography>
          <input
            disabled={!data[optionList.START_FRAME]}
            className="bg-transparent text-white border-[1px] my-[3px] px-[3px] focus:outline-none focus:ring focus:border-blue-300 rounded"
            value={optionValues[optionList.START_FRAME]}
            onChange={(e) => handleValueChange(e, optionList.START_FRAME)}
          />
        </div>
        <div className="flex items-center gap-[5px]">
          <DolbyCheckbox
            size="small"
            checked={data[optionList.INSERT_BLACK_HEAD]}
            onChange={(e) => handleChange(e, optionList.INSERT_BLACK_HEAD)}
          />
          <Typography
            variant="inherit"
            className="text-white min-w-[200px] 2xl:min-w-[250px] min-[1900px]:min-w-[280px]"
          >
            Insert black head frames
          </Typography>
          <input
            disabled={!data[optionList.INSERT_BLACK_HEAD]}
            className="bg-transparent text-white border-[1px] my-[3px] px-[3px] focus:outline-none focus:ring focus:border-blue-300 rounded"
            value={optionValues[optionList.INSERT_BLACK_HEAD]}
            onChange={(e) => handleValueChange(e, optionList.INSERT_BLACK_HEAD)}
          />
        </div>
        <div className="flex items-center gap-[5px]">
          <DolbyCheckbox
            size="small"
            checked={data[optionList.INSERT_BLACK_TAIL]}
            onChange={(e) => handleChange(e, optionList.INSERT_BLACK_TAIL)}
          />
          <Typography
            variant="inherit"
            className="text-white min-w-[200px] 2xl:min-w-[250px] min-[1900px]:min-w-[280px]"
          >
            Insert black tail frames
          </Typography>
          <input
            disabled={!data[optionList.INSERT_BLACK_TAIL]}
            className="bg-transparent text-white border-[1px] my-[3px] px-[3px] focus:outline-none focus:ring focus:border-blue-300 rounded"
            value={optionValues[optionList.INSERT_BLACK_TAIL]}
            onChange={(e) => handleValueChange(e, optionList.INSERT_BLACK_TAIL)}
          />
        </div>
        <div className="flex items-center gap-[5px]">
          <DolbyCheckbox
            size="small"
            checked={data[optionList.REMOVE_TRIM]}
            onChange={(e) => handleChange(e, optionList.REMOVE_TRIM)}
          />
          <Typography
            variant="inherit"
            className="text-white min-w-[200px] 2xl:min-w-[250px] min-[1900px]:min-w-[280px]"
          >
            Remove trim
          </Typography>
          <DolbyTooltip
            title="L2 trims are required for backward compatibility and should not be removed"
            placement="top-start"
          >
            <DolbySelect
              disabled={!data[optionList.REMOVE_TRIM]}
              className="bg-transparent border-[1px] my-[3px] px-[3px] rounded"
              sx={{ padding: "0" }}
              value={optionValues[optionList.REMOVE_TRIM]}
              onChange={(e) => handleValueChange(e, optionList.REMOVE_TRIM)}
            >
              {removeTrimList.map((item: any, index: number) => (
                <DolbyMenuItem key={index} value={item.value}>
                  {item.value}&nbsp;<i>{item.text}</i>
                </DolbyMenuItem>
              ))}
            </DolbySelect>
          </DolbyTooltip>
        </div>
        <div className="flex items-center justify-between gap-[5px]">
          <div className="flex gap-[5px]">
            <DolbyCheckbox
              size="small"
              checked={data[optionList.ADD_COMMENT]}
              onChange={(e) => handleChange(e, optionList.ADD_COMMENT)}
            />
            <Typography
              variant="inherit"
              className="text-white min-w-[200px] 2xl:min-w-[250px] min-[1900px]:min-w-[280px] self-center"
            >
              Add comment
            </Typography>
            <textarea
              disabled={!data[optionList.ADD_COMMENT]}
              maxLength={1024}
              className="border-[1px] my-[3px] px-[3px] absolute z-[1000] left-[242px] 2xl:left-[292px] h-[60px] 2xl:h-[90px]
                w-[200px] 2xl:w-[260px] min-[1900px]:left-[322px]
                focus:outline-none focus:ring focus:border-blue-300 rounded focus:h-[100px]"
              value={optionValues[optionList.ADD_COMMENT]}
              onChange={(e) => handleValueChange(e, optionList.ADD_COMMENT)}
            />
          </div>
        </div>
        <Button
          variant="contained"
          size="small"
          sx={{
            borderRadius: 0,
            backgroundColor: "rgba(255, 255, 255, 0.38)",
            position: "absolute",
            bottom: 2,
            right: 2,
          }}
          onClick={handleReset}
        >
          Reset Values
        </Button>
      </div>
    </>
  );
};
export default OptionList;
