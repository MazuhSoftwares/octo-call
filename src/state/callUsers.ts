import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { CallParticipant, CallUser } from "../webrtc";
import firestoreSignaling from "../services/firestore-signaling";
import type { CallUserIntent } from "../services/firestore-signaling";

type CallUserStatus = "idle" | "pending" | "created" | "error";

export interface CallUserState {
  participants: CallParticipant[];
  pendingUsers: CallUser[];
  status: CallUserStatus;
  errorMessage: string;
}

export const callUsersInitialState: CallUserState = {
  participants: [],
  pendingUsers: [],
  status: "idle",
  errorMessage: "",
};

export const callUsersSlice = createSlice({
  name: "callUsers",
  initialState: callUsersInitialState,
  reducers: {
    setCallUsers: (state, action: PayloadAction<CallUser[]>) => {
      const callUsers = action.payload;

      state.participants = callUsers.filter(
        (callUser) => callUser.joined
      ) as CallParticipant[];

      state.pendingUsers = callUsers.filter(
        (callUser) => !callUser.joined
      ) as CallUser[];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(askToJoinCall.pending, (state) => {
      state.participants = [];
      state.pendingUsers = [];
      state.status = "pending";
      state.errorMessage = "";
    });

    builder.addCase(askToJoinCall.rejected, (state, action) => {
      state.participants = [];
      state.pendingUsers = [];
      state.status = "error";
      state.errorMessage = action.error.message ?? "Unknown error.";
    });

    builder.addCase(
      askToJoinCall.fulfilled,
      (state, action: PayloadAction<CallUser>) => {
        const oldPendingUsers = state.pendingUsers;

        state.status = "created";
        state.errorMessage = "";
        state.pendingUsers = oldPendingUsers.concat(action.payload);
      }
    );
  },
});

export const askToJoinCall = createAsyncThunk(
  "create-call-user",
  ({ userUid, userDisplayName, callUid }: CallUserIntent) =>
    firestoreSignaling.askToJoinCall({
      userUid,
      userDisplayName,
      callUid,
    }),
  {
    condition: (_arg, thunkAPI) =>
      (thunkAPI.getState() as RootState).user.status === "authenticated",
  }
);

export const selectCallUsers = (state: RootState) => state.callUsers;

export const { setCallUsers } = callUsersSlice.actions;

export default callUsersSlice.reducer;
