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

interface UniqueEntity {
  uid: string;
}
