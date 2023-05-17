import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type { MediaDeviceData } from "../webrtc";
import webrtc from "../webrtc";

type DeviceStatus = "idle" | "pending" | "done" | "error";

export interface DevicesState {
  // audio
  userAudioId: string;
  userAudioLabel: string;
  audioInputs: MediaDeviceData[];
  audioStatus: DeviceStatus;
  audioErrorMessage: string;
  // video
  userVideoId: string;
  userVideoLabel: string;
  videoInputs: MediaDeviceData[];
  videoStatus: DeviceStatus;
  videoErrorMessage: string;
}

export const devicesInitialState: DevicesState = {
  // audio
  userAudioId: "",
  userAudioLabel: "",
  audioInputs: [],
  audioStatus: "idle",
  audioErrorMessage: "",
  // video
  userVideoId: "",
  userVideoLabel: "",
  videoInputs: [],
  videoStatus: "idle",
  videoErrorMessage: "",
};

export const devicesSlice = createSlice({
  name: "devices",
  initialState: devicesInitialState,
  reducers: {
    setUserAudioId: (state, action: PayloadAction<string>) => {
      const device = state.audioInputs.find(
        (d) => d.deviceId === action.payload
      );
      if (!device) {
        state.userAudioId = "";
        state.userAudioLabel = "";
        return;
      }

      state.userAudioId = device.deviceId;
      state.userAudioLabel = device.label;
    },
    setUserVideoId: (state, action: PayloadAction<string>) => {
      const device = state.videoInputs.find(
        (d) => d.deviceId === action.payload
      );
      if (!device) {
        state.userVideoId = "";
        state.userVideoLabel = "";
        return;
      }

      state.userVideoId = device.deviceId;
      state.userVideoLabel = device.label;
    },
  },
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

        if (!action.payload.length) {
          state.userAudioId = "";
          state.userAudioLabel = "";
          return;
        }

        const foundAgainByLabel = action.payload.find(
          (d) => d.label === state.userAudioLabel
        );
        state.userAudioId = foundAgainByLabel
          ? foundAgainByLabel.deviceId
          : action.payload[0].deviceId;
        state.userAudioLabel = foundAgainByLabel
          ? foundAgainByLabel.label
          : action.payload[0].label;
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

        if (!action.payload.length) {
          state.userVideoId = "";
          state.userVideoLabel = "";
          return;
        }

        const foundAgainByLabel = action.payload.find(
          (d) => d.label === state.userVideoLabel
        );
        state.userVideoId = foundAgainByLabel
          ? foundAgainByLabel.deviceId
          : action.payload[0].deviceId;
        state.userVideoLabel = foundAgainByLabel
          ? foundAgainByLabel.label
          : action.payload[0].label;
      }
    );
    builder.addCase(retrieveVideoInputs.rejected, (state, action) => {
      state.videoInputs = [];
      state.videoStatus = "done";
      state.videoErrorMessage = action.error.message || "Unknown error.";
    });
  },
});

// actions

export const { setUserAudioId, setUserVideoId } = devicesSlice.actions;

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

export const selectUserAudioId = (state: RootState) =>
  state.devices.userAudioId;
export const selectUserAudioLabel = (state: RootState) =>
  state.devices.userAudioLabel;

export const selectAudioDevices = (state: RootState) => ({
  audioInputs: state.devices.audioInputs,
  audioStatus: state.devices.audioStatus,
  audioErrorMessage: state.devices.audioErrorMessage,
});

export const selectUserVideoId = (state: RootState) =>
  state.devices.userVideoId;
export const selectUserVideoLabel = (state: RootState) =>
  state.devices.userVideoLabel;

export const selectVideoDevices = (state: RootState) => ({
  videoInputs: state.devices.videoInputs,
  videoStatus: state.devices.videoStatus,
  videoErrorMessage: state.devices.videoErrorMessage,
});

// for store

export default devicesSlice.reducer;
