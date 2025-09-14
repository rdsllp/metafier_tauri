import { createSlice } from "@reduxjs/toolkit";
import { IXmlData } from "../../shared/types";

const initialState: IXmlData = {
  fileName: "",
  xmlData: null,
  trimList: {
    L2: [],
    L8: []
  },
  pageLoading: false
}

export const xmlSlice = createSlice({
  name: "xml",
  initialState,
  reducers: {
    setXmlData: (state, action) => {
      state.xmlData = action.payload.xmlData;
      state.fileName = action.payload.fileName;
    },
    setTrimList: (state, action) => {
      state.trimList = action.payload;
    },
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    }
  },
});

export const { setXmlData, setTrimList, setPageLoading } = xmlSlice.actions;
export default xmlSlice.reducer;
