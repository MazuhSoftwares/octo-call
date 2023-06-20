import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  Call,
  CallP2PDescription,
  CallParticipant,
  CallUser,
} from "../webrtc";
import firestoreSignaling, {
  CallUserJoinIntent,
  CallUsersResult,
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
  p2pDescriptions: CallP2PDescription[];
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
  p2pDescriptions: [],
  errorMessage: "",
};

export const callSlice = createSlice({
  name: "call",
  initialState: callInitialState,
  reducers: {
    setUserAsParticipant: (state) => {
      state.userStatus = "participant";
    },
    setP2PDescriptions: (
      state,
      action: PayloadAction<CallP2PDescription[]>
    ) => {
      state.p2pDescriptions = action.payload;
    },
  },
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
      (state, action: PayloadAction<CallUsersResult>) => {
        state.participants = action.payload.participants;
        state.pendingUsers = action.payload.pendingUsers;
      }
    );
  },
});

export const { setP2PDescriptions } = callSlice.actions;

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

  try {
    await firestoreSignaling.leaveCall({
      // TODO: dont await?
      userUid: user.uid,
      callUid: call.uid,
    });
  } catch (error) {
    console.error("Failed to send leaving thru signaling.", error);
  }
});

export const setCallUsers = createAsyncThunk(
  "set-call-users",
  async (callUsersResult: CallUsersResult, thunkApi) => {
    const { user, call } = thunkApi.getState() as RootState;

    const isAmongParticipants = callUsersResult.participants.some(
      (p) => p.uid === user.uid
    );
    const isAmongPendingUsers = callUsersResult.pendingUsers.some(
      (u) => u.uid === user.uid
    );
    if (call.userStatus === "pending-user" && isAmongParticipants) {
      await firestoreSignaling.joinAsNewestParticipation({
        callUid: call.uid,
        userUid: user.uid,
        participantsUids: call.participants.map((p) => p.uid),
      });
      thunkApi.dispatch(callSlice.actions.setUserAsParticipant()); // joined
    } else if (call.userStatus === "participant" && !isAmongParticipants) {
      thunkApi.dispatch(leaveCall()); // left
    } else if (call.userStatus === "pending-user" && !isAmongPendingUsers) {
      thunkApi.dispatch(leaveCall()); // rejected
    }

    return callUsersResult;
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
  "reject-pending-user",
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

export const selectSlotDescriptionFn =
  (localUid: string, remoteUid: string) => (state: RootState) =>
    state.call.p2pDescriptions.find(
      (it) =>
        localUid === it.newestPeerUid ||
        localUid === it.oldestPeerUid ||
        remoteUid === it.newestPeerUid ||
        remoteUid === it.oldestPeerUid
    );

export default callSlice.reducer;
