import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { CallUser } from "../webrtc";
import { RootState } from ".";
import firestoreSignaling from "../services/firestore-signaling";

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
  extraReducers: (builder) => {
    builder.addCase(createCallUser.pending, (state) => {
      state.uid = "";
      state.userUid = "";
      state.userDisplayName = "";
      state.status = "pending";
      state.errorMessage = "";
    });

    builder.addCase(
      createCallUser.fulfilled,
      (state, action: PayloadAction<CallUser>) => {
        state.uid = action.payload.uid;
        state.userUid = action.payload.userUid;
        state.userDisplayName = action.payload.userDisplayName;
        state.status = action.payload.uid ? "created" : "idle";
        state.errorMessage = "";
      }
    );

    builder.addCase(createCallUser.rejected, (state, action) => {
      state.uid = "";
      state.userUid = "";
      state.userDisplayName = "";
      state.status = "error";
      state.errorMessage = action.error.message ?? "Unknown error.";
    });
  },
});

export const createCallUser = createAsyncThunk(
  "call",
  ({
    userUid,
    userDisplayName,
  }: Pick<CallUserState, "userUid" | "userDisplayName">) =>
    firestoreSignaling.create("calls", {
      userUid,
      userDisplayName,
    }),
  {
    condition: (_arg, thunkAPI) =>
      (thunkAPI.getState() as RootState).user.status === "authenticated",
  }
);

export const selectCallUser = (state: RootState) => state.call;

export default callUserSlice.reducer;
