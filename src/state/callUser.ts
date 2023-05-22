import { createSlice } from "@reduxjs/toolkit";
import type { CallUser } from "../webrtc";
import { RootState } from ".";

type CallStatus = "idle" | "pending" | "created" | "error";

export interface CallUserState extends CallUser {
  status: CallStatus;
  errorMessage: string;
}

export const callInitialState: CallUserState = {
  uid: "",
  userUid: "",
  userDisplayName: "",
  status: "idle",
  errorMessage: "",
};

export const callUserSlice = createSlice({
  name: "callUser",
  initialState: callInitialState,
  reducers: {},
});

export const selectCallUser = (state: RootState) => state.call;

export default callUserSlice.reducer;
