import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";
import user from "./user";
import devices from "./devices";
import call from "./call";
import callUsers from "./callUsers";

const rootReducer = combineReducers({
  user,
  devices,
  call,
  callUsers,
});

export type PreloadedAppState = PreloadedState<RootState>;

export const setupAppStore = (preloadedState?: PreloadedAppState) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export const store = setupAppStore();

export type RootState = ReturnType<typeof rootReducer>;

export type AppStore = ReturnType<typeof setupAppStore>;

export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).debugState = store.getState;
