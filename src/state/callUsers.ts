import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { CallParticipant, CallUser } from "../webrtc";

export interface CallUserState {
  participants: CallParticipant[];
  pendingUsers: CallUser[];
}

export const callUsersInitialState: CallUserState = {
  participants: [],
  pendingUsers: [],
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
});

export const selectCallUsers = (state: RootState) => state.callUsers;

export const { setCallUsers } = callUsersSlice.actions;

export default callUsersSlice.reducer;
