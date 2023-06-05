import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { CallUser } from "../webrtc";

export interface CallUserState {
  participants: CallUser[];
}

export const callUsersInitialState: CallUserState = {
  participants: [],
};

export const callUsersSlice = createSlice({
  name: "callUsers",
  initialState: callUsersInitialState,
  reducers: {
    setCallUsers: (state, action: PayloadAction<CallUser[]>) => {
      const callUsers = action.payload;
      state.participants = callUsers.filter((callUser) => callUser.joined);
    },
  },
});

export const selectCallUsers = (state: RootState) => state.callUsers;

export const { setCallUsers } = callUsersSlice.actions;

export default callUsersSlice.reducer;
