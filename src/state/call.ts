import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Call } from "../webrtc";
import firestoreSignaling from "../services/firestore-signaling";
import { RootState } from ".";

type CallStatus = "idle" | "pending" | "inProgress" | "error";

export interface CallState extends Call {
  status: CallStatus;
  errorMessage: string;
}

export const callInitialState: CallState = {
  uid: "",
  displayName: "",
  hostId: "",
  hostDisplayName: "",
  status: "idle",
  errorMessage: "",
};

export const callSlice = createSlice({
  name: "call",
  initialState: callInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createCall.pending, (state) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.status = "pending";
      state.errorMessage = "";
    });

    builder.addCase(
      createCall.fulfilled,
      (state, action: PayloadAction<Call>) => {
        state.uid = action.payload.uid;
        state.displayName = action.payload.displayName;
        state.hostId = action.payload.hostId;
        state.hostDisplayName = action.payload.hostDisplayName;
        state.status = action.payload.uid ? "inProgress" : "idle";
        state.errorMessage = "";
      }
    );

    builder.addCase(createCall.rejected, (state, action) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.status = "error";
      state.errorMessage = action.error.message ?? "Unknown error.";
    });

    builder.addCase(leaveCall.fulfilled, (state) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.status = "idle";
      state.errorMessage = "";
    });
  },
});

export const createCall = createAsyncThunk(
  "create-call",
  async ({ displayName }: Pick<Call, "displayName">, thunkAPI) => {
    const user = (thunkAPI.getState() as RootState).user;

    return firestoreSignaling.createCall({
      displayName,
      hostDisplayName: user.displayName,
      hostId: user.uid,
    });
  },
  {
    condition: (_arg, thunkAPI) =>
      (thunkAPI.getState() as RootState).user.status === "authenticated",
  }
);

export const leaveCall = createAsyncThunk("leave-call", async () => {
  return true; // TODO
});

export const selectCall = (state: RootState) => state.call;

export const selectCallDisplayName = (state: RootState) =>
  state.call.displayName;

export const selectHasLeftCall = (state: RootState) =>
  state.call.status === "idle";

export default callSlice.reducer;
