import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import get from "lodash.get";
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
  iceServersConfig?: RTCIceServer;
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
    setIceServersConfig: (state, action: PayloadAction<RTCIceServer>) => {
      state.iceServersConfig = action.payload;
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

export interface PatchingDescription extends Partial<CallP2PDescription> {
  uid: CallP2PDescription["uid"];
}

export const patchP2PDescription = createAsyncThunk(
  "patch-p2p-descriptions",
  async (patchingDescription: PatchingDescription, thunkApi) => {
    const { call } = thunkApi.getState() as RootState;

    const peersFoundDescription = call.p2pDescriptions.find(
      (d) => d.uid === patchingDescription.uid
    );

    const patchingParticipation = {
      callUid: call.uid,
      p2pDescription: {
        ...peersFoundDescription,
        ...patchingDescription,
      },
    };

    firestoreSignaling.updateParticipation(patchingParticipation);
  }
);

export const createCall = createAsyncThunk(
  "create-call",
  async ({ displayName }: Pick<Call, "displayName">, thunkAPI) => {
    const { user, call } = thunkAPI.getState() as RootState;

    if (!call.iceServersConfig) {
      console.log("Retrieving ICE servers.");
      const retrieved = await firestoreSignaling.getIceServersConfig();
      thunkAPI.dispatch(callSlice.actions.setIceServersConfig(retrieved));
    }

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
      if (!call.iceServersConfig) {
        const retrieved = await firestoreSignaling.getIceServersConfig();
        thunkApi.dispatch(callSlice.actions.setIceServersConfig(retrieved));
      }

      await firestoreSignaling.joinAsNewerParticipation({
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

export const selectUserParticipationOrder = (state: RootState): number =>
  get(
    state.call.participants.find((it) => it.uid === state.user.uid),
    "joined",
    -1
  );

export const selectP2PDescriptionFn =
  (remoteUid: string) => (state: RootState) =>
    state.call.p2pDescriptions.find(
      (it) =>
        state.user.uid === it.newerPeerUid ||
        state.user.uid === it.olderPeerUid ||
        remoteUid === it.newerPeerUid ||
        remoteUid === it.olderPeerUid
    );

export const selectP2PDescriptionUidByRemoteUidFn =
  (remoteUid: string) => (state: RootState) =>
    state.call.p2pDescriptions.find(
      (it) =>
        state.user.uid === it.newerPeerUid ||
        state.user.uid === it.olderPeerUid ||
        remoteUid === it.newerPeerUid ||
        remoteUid === it.olderPeerUid
    )?.uid;

export const selectP2PDescriptionByUidFn =
  (descriptionUid: string) => (state: RootState) =>
    state.call.p2pDescriptions.find((it) => it.uid === descriptionUid);

export const selectIceServersConfig = (state: RootState) =>
  state.call.iceServersConfig;

export default callSlice.reducer;
