import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Call } from "../webrtc";
import firestoreSignaling from "../services/firestore-signaling";
import { RootState } from ".";

type HostCallStatus = "creating-and-joining" | "failed-as-host";
type GuestCallStatus = "asking-to-join" | "pending-user" | "failed-as-guest";
type CommonCallStatus = "idle" | "participant";
export type CallUserStatus =
  | CommonCallStatus
  | HostCallStatus
  | GuestCallStatus;

export interface CallState extends Call {
  userStatus: CallUserStatus;
  errorMessage: string;
}

export const callInitialState: CallState = {
  uid: "",
  displayName: "",
  hostId: "",
  hostDisplayName: "",
  userStatus: "idle",
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
      state.userStatus = "creating-and-joining";
      state.errorMessage = "";
    });

    builder.addCase(
      createCall.fulfilled,
      (state, action: PayloadAction<Call>) => {
        state.uid = action.payload.uid;
        state.displayName = action.payload.displayName;
        state.hostId = action.payload.hostId;
        state.hostDisplayName = action.payload.hostDisplayName;
        state.userStatus = action.payload.uid ? "participant" : "idle";
        state.errorMessage = "";
      }
    );

    builder.addCase(createCall.rejected, (state, action) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.userStatus = "failed-as-host";
      state.errorMessage = action.error.message ?? "Unknown error.";
    });

    builder.addCase(leaveCall.fulfilled, (state) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.userStatus = "idle";
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

export const selectCallUid = (state: RootState) => state.call.uid;

export const selectCallHostId = (state: RootState) => state.call.hostId;

export const selectCallDisplayName = (state: RootState) =>
  state.call.displayName;

export const selectCallUserStatus = (state: RootState) => state.call.userStatus;

export default callSlice.reducer;
