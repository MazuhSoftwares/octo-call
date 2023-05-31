import { retrieveMediaInputs } from "./media-devices";
import { startAudioPreview, startVideoPreview } from "./media-devices-preview";
import { makeP2PCallConnection } from "./p2p-call-connection";

export type * from "./media-devices";
export type * from "./media-devices-preview";
export type * from "./p2p-call-connection";

export default {
  retrieveMediaInputs,
  startAudioPreview,
  startVideoPreview,
  makeP2PCallConnection,
};

export interface User extends UniqueEntity {
  displayName: string;
  email: string;
}

export interface Call extends UniqueEntity {
  displayName: string;
  hostId: string;
  hostDisplayName: string;
  participantsUids: string[];
}

export interface CallUser extends UniqueEntity {
  userUid: string;
  userDisplayName: string;
  joined?: number;
}

export interface CallUserP2PDescription extends UniqueEntity {
  newestParticipantUid: string;
  newestParticipantOfferSDP: string;
  oldestParticipantUid: string;
  oldestParticipantAnswerSDP: string;
}

export type MediaType = "audio" | "video";

export type MediaDeviceData = Pick<
  MediaDeviceInfo,
  "deviceId" | "kind" | "label"
>;

interface UniqueEntity {
  uid: string;
}
