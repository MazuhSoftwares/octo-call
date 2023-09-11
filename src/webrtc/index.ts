import "webrtc-adapter";
import * as domHelpers from "./dom-helpers";
import * as agentHelpers from "./agent-helpers";
import { retrieveMediaInputs } from "./media-devices";
import { startAudioPreview, startVideoPreview } from "./media-devices-preview";
import { makeP2PCallConnection } from "./p2p-call-connection";

export type * from "./media-devices";
export type * from "./media-devices-preview";
export type * from "./p2p-call-connection";

export default {
  domHelpers,
  agentHelpers,
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
}

export interface CallUser extends UniqueEntity {
  userUid: string;
  userDisplayName: string;
  joined?: number;
}

export interface CallParticipant extends CallUser {
  joined: number;
}

export interface CallPendingUser extends CallUser {
  joined: undefined;
}

export interface CallP2PDescription extends UniqueEntity {
  newerPeerUid?: string;
  newerPeerOffer?: RTCSessionDescriptionInit;
  newerPeerIceCandidates?: RTCIceCandidateInit[];
  olderPeerUid?: string;
  olderPeerAnswer?: RTCSessionDescriptionInit;
  olderPeerIceCandidates?: RTCIceCandidateInit[];
}

export type MediaType = "audio" | "video";

export type MediaDeviceData = Pick<
  MediaDeviceInfo,
  "deviceId" | "kind" | "label"
>;

interface UniqueEntity {
  uid: string;
}
