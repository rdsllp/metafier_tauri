import { Box, Button, Tooltip, Typography, TextField } from "@mui/material";
import { DolbySelect } from "../../components";
import { DolbyMenuItem, DolbyAutocomplete, DolbyTooltip } from "../../components";

interface IEditSummaryProps {
  fileName: string;
  data: any;
  originData: any;
  setData: (data: any) => void;
}

const EditSummary = (props: IEditSummaryProps) => {
  const {fileName, data, originData, setData} = props;
  const handleChange = (e: any, key: string) => {
    setData((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: e.target.value,
      },
    }))
  }
  const handleReset = () => {
    setData(originData);
  }
  const handleAutocompleteChange = (e: any, key: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value,
      },
    }))
  }
  return (
    <Box className="m-[20px] w-1/2 flex flex-col">
      <div>
        <Typography
          variant="body2"
          component="span"
          fontSize="22px"
          color="white"
          className="pr-[20px]"
        >
          Primary
        </Typography>
        <DolbyTooltip title={fileName} placement="top-end">
          <Typography
            variant="body2"
            component="span"
            fontSize="14px"
            color="rgb(102, 179, 255)"
            sx={{ fontWeight: 900 }}
          >
            {fileName.length > 0 &&
              " ( " +
                (fileName.length > 45
                  ? fileName.substring(0, 45) + "..."
                  : fileName) +
                " )"}
          </Typography>
        </DolbyTooltip>
      </div>

      <Box className="flex flex-col relative mb-[10px] border-[1px] rounded border-gray-300 grow py-[20px] overflow-y-auto 
          text-[16px] xl:text-[20px] min-[1900px]:text-[24px]" 
        sx={{fontFamily: '"Roboto","Helvetica","Arial",sans-serif'}}>
        {Object.keys(data).map((key: string, idx: number) => (
          <Box key={idx} className="flex w-full text-white ">
            {
              data[key].type >= 0 &&
              <Box className="px-[8px] py-[4px] w-[46%] text-right">
                <Typography variant="inherit" className={data[key].value != originData[key].value ? "text-[#1b6ef3] italic": ""}>{key}</Typography>
              </Box>
            }
            
            {data[key].type === 0 && (
              <Box className="px-[8px] py-[4px]">
                <Typography variant="inherit">{data[key].value}</Typography>
              </Box>
            )}
            {data[key].type === 1 && (
              <input
                className="bg-transparent ml-[7px] border-[1px] my-[3px] px-[3px] focus:outline-none focus:ring focus:border-blue-300 rounded w-[40%]"
                value={data[key].value}
                min={0}
                max={10000}
                required
                onChange={(e) => handleChange(e, key)}
              />
            )}
            {data[key].type === 2 && (
                key == "Mastering Monitor" ? (
                  data[key].value != originData[key].value ? (
                    <DolbyTooltip placement="top" arrow 
                      title={
                        <span>
                          <u><em>Caution:</em></u>
                          Changing the Mastering Monitor inside an XML is not recommended, except in very special cases.
                        </span>
                      }>
                      <DolbySelect
                      className="bg-transparent ml-[7px] border-[1px] my-[3px] px-[3px] rounded w-[40%] "
                        value={data[key].value}
                        onChange={(e) => handleChange(e, key)}
                        sx={{ padding: "0" }}
                      >
                      {
                        data[key].list.map((item: any) => (
                          <DolbyMenuItem key={item.value} value={item.value}>
                            {item.text} 
                            (<span>ID ({item.value})</span>)
                          </DolbyMenuItem>
                        ))
                      }
                      </DolbySelect>
                    </DolbyTooltip>
                  ) : (
                    <DolbySelect
                      className="bg-transparent ml-[7px] border-[1px] my-[3px] px-[3px] rounded w-[40%] "
                      value={data[key].value}
                      onChange={(e) => handleChange(e, key)}
                      size="small"
                      sx={{ padding: "0" }}
                    >
                    {
                      data[key].list.map((item: any) => (
                        <DolbyMenuItem key={item.value} value={item.value}>
                          {item.text} 
                          (<span>ID ({item.value})</span>)
                        </DolbyMenuItem>
                      ))
                    }
                    </DolbySelect>
                  )
                ) : (
                <DolbySelect
                  className="bg-transparent ml-[7px] border-[1px] my-[3px] px-[3px] rounded [w-40%]"
                  value={data[key].value}
                  onChange={(e) => handleChange(e, key)}
                  size="small"
                  sx={{ padding: "0" }}
                >
                  {
                    data[key].list.map((item: any) => (
                      <DolbyMenuItem key={item.value} value={item.value}>
                        {item.text} 
                      </DolbyMenuItem>
                    ))
                  }
                </DolbySelect>
                )
            )}
            {
            data[key].type === 3 && ( // For frame rate
              <DolbyAutocomplete
                freeSolo
                value={data[key].value}
                onChange={(e, value) => handleAutocompleteChange(e, key, value)}
                options={data[key].list.map((option: any) => option.value)}
                getOptionLabel={(option: string) => option}
                renderInput={(params) => 
                  <div ref={params.InputProps.ref}>
                    <input
                      {...params.inputProps}
                      className="bg-transparent ml-[7px] border-[1px] my-[3px] px-[3px] focus:outline-none focus:ring focus:border-blue-300 rounded w-[40%]"
                      required
                    /> 
                  </div>
                  }
                renderOption={(props: any, option: string) => (
                  <DolbyMenuItem {...props}>
                    {option} fps 
                  </DolbyMenuItem>
                )}
                />
              )
            
            }
          </Box>
        ))}

        <Button variant="contained" size="small" 
          sx={{
            borderRadius: 0, 
            backgroundColor: 'rgba(255, 255, 255, 0.38)',
            position: 'absolute',
            bottom: 2,
            right: 2,
            }} 
          onClick={handleReset}>
            Reset Values
        </Button>
      </Box>
    </Box>
  );
};

export default EditSummary;
