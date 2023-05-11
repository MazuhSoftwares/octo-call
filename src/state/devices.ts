import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type { MediaDeviceData } from "../webrtc";
import webrtc from "../webrtc";

type DeviceStatus = "idle" | "pending" | "done" | "error";

export interface DevicesState {
  // audio
  audioInputs: MediaDeviceData[];
  audioStatus: DeviceStatus;
  audioErrorMessage: string;
  // video
  videoInputs: MediaDeviceData[];
  videoStatus: DeviceStatus;
  videoErrorMessage: string;
}

export const devicesInitialState: DevicesState = {
  // audio
  audioInputs: [],
  audioStatus: "idle",
  audioErrorMessage: "",
  // video
  videoInputs: [],
  videoStatus: "idle",
  videoErrorMessage: "",
};

export const devicesSlice = createSlice({
  name: "devices",
  initialState: devicesInitialState,
  reducers: {},
  extraReducers: (builder) => {
    // audio
    builder.addCase(retrieveAudioInputs.pending, (state) => {
      state.audioInputs = [];
      state.audioStatus = "pending";
      state.audioErrorMessage = "";
    });
    builder.addCase(
      retrieveAudioInputs.fulfilled,
      (state, action: PayloadAction<MediaDeviceData[]>) => {
        state.audioInputs = action.payload;
        state.audioStatus = "done";
        state.audioErrorMessage = "";
      }
    );
    builder.addCase(retrieveAudioInputs.rejected, (state, action) => {
      state.audioInputs = [];
      state.audioStatus = "done";
      state.audioErrorMessage = action.error.message || "Unknown error.";
    });

    // video
    builder.addCase(retrieveVideoInputs.pending, (state) => {
      state.videoInputs = [];
      state.videoStatus = "pending";
      state.videoErrorMessage = "";
    });
    builder.addCase(
      retrieveVideoInputs.fulfilled,
      (state, action: PayloadAction<MediaDeviceData[]>) => {
        state.videoInputs = action.payload;
        state.videoStatus = "done";
        state.videoErrorMessage = "";
      }
    );
    builder.addCase(retrieveVideoInputs.rejected, (state, action) => {
      state.videoInputs = [];
      state.videoStatus = "done";
      state.videoErrorMessage = action.error.message || "Unknown error.";
    });
  },
});

// thunks

export const retrieveAudioInputs = createAsyncThunk(
  "devices/retrieve-audio-inputs",
  async () => {
    return webrtc.retrieveMediaInputs("audio");
  }
);

export const retrieveVideoInputs = createAsyncThunk(
  "devices/retrieve-video-inputs",
  async () => {
    return webrtc.retrieveMediaInputs("video");
  }
);

// selectors

export const selectAudioDevices = (state: RootState) => ({
  audioInputs: state.devices.audioInputs,
  audioStatus: state.devices.audioStatus,
  audioErrorMessage: state.devices.audioErrorMessage,
});

export const selectVideoDevices = (state: RootState) => ({
  videoInputs: state.devices.videoInputs,
  videoStatus: state.devices.videoStatus,
  videoErrorMessage: state.devices.videoErrorMessage,
});

// for store

export default devicesSlice.reducer;
