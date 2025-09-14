import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import xmlReducer from "./slices/xmlSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
    reducer: {
        xml: xmlReducer,
        notification: notificationReducer
    }
});
type AppDispatch = typeof store.dispatch;
type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;