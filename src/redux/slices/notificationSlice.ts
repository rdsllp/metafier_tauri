import { createSlice } from "@reduxjs/toolkit";
import { INotificationData } from "../../shared/types";

const initialState: INotificationData = {
  message: '',
  type: 'success',
  open: false,
}

export const notificationSlice = createSlice({
  name: "xml",
  initialState,
  reducers: {
    showNotification: (state, action) => {
        state.message = action.payload.message;
        state.type = action.payload.type || 'success';
        state.open = true;
    },
    hideNotification: (state) => {
        state.open = false;
    }
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
