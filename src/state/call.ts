import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Call } from "../webrtc";
import firestoreCrud from "../services/firestore-crud";
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
  participantsUids: [],
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
      state.participantsUids = [];
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
        state.participantsUids = action.payload.participantsUids;
        state.status = action.payload.uid ? "inProgress" : "idle";
        state.errorMessage = "";
      }
    );

    builder.addCase(createCall.rejected, (state, action) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.participantsUids = [];
      state.status = "error";
      state.errorMessage = action.error.message ?? "Unknown error.";
    });
  },
});

export const createCall = createAsyncThunk(
  "call",
  ({
    hostId,
    hostDisplayName,
    displayName,
  }: Pick<CallState, "hostId" | "hostDisplayName" | "displayName">) =>
    firestoreCrud.createDocument("calls", {
      displayName,
      hostDisplayName,
      hostId,
      participantsUids: [hostId],
    }),
  {
    condition: (_arg, thunkAPI) =>
      (thunkAPI.getState() as RootState).user.status === "authenticated",
  }
);

export const selectCall = (state: RootState) => state.call;

export default callSlice.reducer;
