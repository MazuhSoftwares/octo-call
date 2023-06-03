import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { CallUser } from "../webrtc";

type CallUsersStatus = "idle" | "pending" | "done" | "error";

export interface CallUserState {
  participants: CallUser[];
  errorMessage: string;
  status: CallUsersStatus;
}

export const callUsersInitialState: CallUserState = {
  participants: [],
  status: "idle",
  errorMessage: "",
};

export const callUsersSlice = createSlice({
  name: "callUsers",
  initialState: callUsersInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setCallUsers.pending, (state) => {
      state.participants = [];
      state.status = "pending";
      state.errorMessage = "";
    });
    builder.addCase(
      setCallUsers.fulfilled,
      (state, action: PayloadAction<Pick<CallUserState, "participants">>) => {
        state.participants = action.payload.participants;
        state.status = "done";
        state.errorMessage = "";
      }
    );
    builder.addCase(setCallUsers.rejected, (state, action) => {
      state.participants = [];
      state.status = "error";
      state.errorMessage = action.error.message ?? "Unknown error.";
    });
  },
});

export const setCallUsers = createAsyncThunk(
  "set-call-users",
  (callUsers: CallUser[], thunkAPI) => {
    const participantsUids = (thunkAPI.getState() as RootState).call
      .participantsUids;

    return {
      participants: callUsers.filter((callUser) =>
        participantsUids.includes(callUser.userUid)
      ),
    };
  }
);

export const selectCallUsers = (state: RootState) => state.callUsers;

export default callUsersSlice.reducer;
