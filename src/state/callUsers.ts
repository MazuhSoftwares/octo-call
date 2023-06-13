import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { CallParticipant, CallUser } from "../webrtc";
import firestoreSignaling from "../services/firestore-signaling";
import type { CallUserIntent } from "../services/firestore-signaling";

export interface CallUserState {
  participants: CallParticipant[];
  pendingUsers: CallUser[];
  errorMessage: string;
}

export const callUsersInitialState: CallUserState = {
  participants: [],
  pendingUsers: [],
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
      state.errorMessage = "";
    });

    builder.addCase(askToJoinCall.rejected, (state, action) => {
      state.errorMessage = action.error.message ?? "Unknown error.";
    });

    builder.addCase(askToJoinCall.fulfilled, (state) => {
      state.errorMessage = "";
    });
  },
});

export const askToJoinCall = createAsyncThunk(
  "create-call-user",
  ({ callUid }: Pick<CallUserIntent, "callUid">, thunkApi) => {
    const user = (thunkApi.getState() as RootState).user;
    return firestoreSignaling.askToJoinCall({
      callUid,
      userUid: user.uid,
      userDisplayName: user.displayName,
    });
  }
);

export const acceptPendingUser = createAsyncThunk(
  "accept-pending-user",
  ({ userUid }: Pick<CallUserIntent, "userUid">, thunkApi) => {
    const call = (thunkApi.getState() as RootState).call;

    return firestoreSignaling.acceptPendingUser(userUid, call.uid);
  }
);

export const refusePendingUser = createAsyncThunk(
  "refuse-pending-user",
  ({ userUid }: Pick<CallUserIntent, "userUid">, thunkApi) => {
    const call = (thunkApi.getState() as RootState).call;

    return firestoreSignaling.refusePendingUser(userUid, call.uid);
  }
);

export const selectCallUsers = (state: RootState) => state.callUsers;

export const { setCallUsers } = callUsersSlice.actions;

export default callUsersSlice.reducer;
