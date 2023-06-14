import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Call, CallParticipant, CallUser } from "../webrtc";
import firestoreSignaling, {
  CallUserJoinIntent,
} from "../services/firestore-signaling";
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
  participants: CallParticipant[];
  pendingUsers: CallUser[];
  errorMessage: string;
}

export const callInitialState: CallState = {
  uid: "",
  displayName: "",
  hostId: "",
  hostDisplayName: "",
  userStatus: "idle",
  participants: [],
  pendingUsers: [],
  errorMessage: "",
};

export const callSlice = createSlice({
  name: "call",
  initialState: callInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createCall.pending, (state, action) => {
      state.uid = "";
      state.displayName = action.meta.arg.displayName;
      state.hostId = "";
      state.hostDisplayName = "";
      state.userStatus = "creating-and-joining";
      state.pendingUsers = [];
      state.participants = [];
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

    builder.addCase(askToJoinCall.pending, (state, action) => {
      state.uid = action.meta.arg.callUid;
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.userStatus = "asking-to-join";
      state.pendingUsers = [];
      state.participants = [];
      state.errorMessage = "";
    });

    builder.addCase(askToJoinCall.fulfilled, (state) => {
      state.userStatus = "pending-user";
      state.errorMessage = "";
    });

    builder.addCase(askToJoinCall.rejected, (state, action) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.userStatus = "failed-as-guest";
      state.pendingUsers = [];
      state.participants = [];
      state.errorMessage = action.error.message ?? "Unknown error.";
    });

    builder.addCase(leaveCall.fulfilled, (state) => {
      state.uid = "";
      state.displayName = "";
      state.hostId = "";
      state.hostDisplayName = "";
      state.userStatus = "idle";
      state.pendingUsers = [];
      state.participants = [];
      state.errorMessage = "";
    });

    builder.addCase(
      setCallUsers.fulfilled,
      (
        state,
        action: PayloadAction<{ callUsers: CallUser[]; currentUserUid: string }>
      ) => {
        const { callUsers, currentUserUid } = action.payload;

        state.participants = callUsers.filter(
          (callUser) => callUser.joined
        ) as CallParticipant[];
        state.pendingUsers = callUsers.filter(
          (callUser) => !callUser.joined
        ) as CallUser[];

        const isAmongParticipants = state.participants.some(
          (p) => p.uid === currentUserUid
        );

        if (state.userStatus === "pending-user" && isAmongParticipants) {
          state.userStatus = "participant";
          return;
        }

        if (state.userStatus === "participant" && !isAmongParticipants) {
          state.userStatus = "idle"; // left?
          return;
        }
      }
    );
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
  }
);

export const askToJoinCall = createAsyncThunk(
  "ask-to-join-call",
  ({ callUid }: Pick<CallUserJoinIntent, "callUid">, thunkApi) => {
    const { user } = thunkApi.getState() as RootState;

    return firestoreSignaling.askToJoinCall({
      callUid,
      userUid: user.uid,
      userDisplayName: user.displayName,
    });
  }
);

export const leaveCall = createAsyncThunk("leave-call", async (_, thunkApi) => {
  const { user, call } = thunkApi.getState() as RootState;

  await firestoreSignaling.leaveCall({ userUid: user.uid, callUid: call.uid });
});

export const setCallUsers = createAsyncThunk(
  "set-call-users",
  (callUsers: CallUser[], thunkApi) => {
    const { user } = thunkApi.getState() as RootState;
    return { callUsers, currentUserUid: user.uid };
  }
);

export const acceptPendingUser = createAsyncThunk(
  "accept-pending-user",
  ({ userUid }: Pick<CallUserJoinIntent, "userUid">, thunkApi) => {
    const { call } = thunkApi.getState() as RootState;

    return firestoreSignaling.acceptPendingUser(userUid, call.uid);
  }
);

export const rejectPendingUser = createAsyncThunk(
  "refuse-pending-user",
  ({ userUid }: Pick<CallUserJoinIntent, "userUid">, thunkApi) => {
    const { call } = thunkApi.getState() as RootState;

    return firestoreSignaling.rejectPendingUser({ userUid, callUid: call.uid });
  }
);

export const selectCall = (state: RootState) => state.call;

export const selectCallHostId = (state: RootState) => state.call.hostId;

export const selectCallUid = (state: RootState) => state.call.uid;
export const selectCallDisplayName = (state: RootState) =>
  state.call.displayName;

export const selectCallUserStatus = (state: RootState) => state.call.userStatus;

export const selectParticipants = (state: RootState) => state.call.participants;
export const selectPendingUsers = (state: RootState) => state.call.pendingUsers;

export default callSlice.reducer;
