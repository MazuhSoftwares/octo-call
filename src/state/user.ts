import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type { User } from "../webrtc";
import firestoreAuth from "../services/firestore-auth";
import { leaveCall } from "./call";

type UserStatus = "idle" | "pending" | "authenticated" | "error";

export interface UserState extends User {
  status: UserStatus;
  errorMessage: string;
  isSessionBlocked: boolean;
}

export const userInitialState: UserState = {
  uid: "",
  displayName: "",
  email: "",
  status: "idle",
  deviceUuid: "",
  errorMessage: "",
  isSessionBlocked: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState: userInitialState,
  reducers: {
    setSessionBlocked: (state) => {
      state.isSessionBlocked = true;
    },
    setSessionActive: (state) => {
      state.isSessionBlocked = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.uid = "";
      state.displayName = "";
      state.email = "";
      state.status = "pending";
      state.deviceUuid = "";
      state.errorMessage = "";
    });

    builder.addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
      state.uid = action.payload.uid || "";
      state.displayName = action.payload.displayName || "";
      state.email = action.payload.email || "";
      state.status = action.payload.uid ? "authenticated" : "idle";
      state.deviceUuid = action.payload.deviceUuid;
      state.errorMessage = state.errorMessage = "";
    });

    builder.addCase(login.rejected, (state, action) => {
      state.uid = "";
      state.displayName = "";
      state.email = "";
      state.status = "error";
      state.deviceUuid = "";
      state.errorMessage = action.error.message || "Unknown error.";
    });

    builder.addCase(logout.fulfilled, () => userInitialState);
  },
});

export const loadUser = createAsyncThunk(
  "user/login",
  () => firestoreAuth.loadUser(),
  {
    condition: (_arg, thunkAPI) =>
      (thunkAPI.getState() as RootState).user.status === "idle",
  }
);

export const login = createAsyncThunk(
  "user/login",
  () => firestoreAuth.login().then(firestoreAuth.loadUser),
  {
    condition: (_arg, thunkAPI) =>
      (thunkAPI.getState() as RootState).user.status === "idle",
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  (_, thunkApi) => {
    firestoreAuth.logout();
    thunkApi.dispatch(leaveCall());
  },
  {
    condition: (_arg, thunkAPI) =>
      (thunkAPI.getState() as RootState).user.status === "authenticated",
  }
);

export const selectUserDisplayName = (state: RootState) =>
  state.user.displayName;

export const selectUserUid = (state: RootState) => state.user.uid;
export const selectUserDeviceUuid = (state: RootState) => state.user.deviceUuid;

export const selectIsUserPendingAuthentication = (state: RootState) =>
  state.user.status === "pending";
export const selectIsUserAuthenticated = (state: RootState) =>
  Boolean(state.user.status === "authenticated" && state.user.uid);

export const selectIsSessionBlocked = (state: RootState) =>
  state.user.isSessionBlocked;

export const { setSessionBlocked, setSessionActive } = userSlice.actions;

export default userSlice.reducer;
