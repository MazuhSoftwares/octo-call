import { retrieveMediaInputs } from "./media-devices";

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

export default {
  retrieveMediaInputs,
};

interface UniqueEntity {
  uid: string;
}