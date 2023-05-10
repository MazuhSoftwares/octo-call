import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../webrtc";
import type { RootState } from ".";

type UserStatus = "idle" | "pending" | "authenticated" | "error";

export interface UserState extends User {
  status: UserStatus;
  errorMessage: string;
}

const initialState: UserState = {
  uid: "",
  displayName: "",
  email: "",
  status: "idle",
  errorMessage: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoff: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.uid = "";
      state.displayName = "";
      state.email = "";
      state.status = "pending";
      state.errorMessage = "";
    });

    builder.addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
      state.uid = action.payload.uid;
      state.displayName = action.payload.displayName;
      state.email = action.payload.email;
      state.status = "authenticated";
      state.errorMessage = "";
    });

    builder.addCase(login.rejected, (state, action) => {
      state.uid = "";
      state.displayName = "";
      state.email = "";
      state.status = "error";
      state.errorMessage = action.error.message || "Unknown error.";
    });
  },
});

export const login = createAsyncThunk("user/login", async () => {
  await new Promise((r) => setTimeout(r, 1000)); // TODO: add real auth
  return {
    uid: "abc123def456", // TODO: add real user credentials
    displayName: "Jane Doe",
    email: "jane@example.com",
  };
});

export const { logoff } = userSlice.actions;

export const selectCurrentUser = (state: RootState) => state.user;

export default userSlice.reducer;
