import { v4 as uuidv4 } from "uuid";
import { Call, CallParticipant, CallUser, User } from "../webrtc";

export function createUser(overrideValues: Partial<User> = {}): User {
  const defaultValues: User = {
    uid: uuidv4(),
    displayName: getRandomString(),
    email: getRandomEmail(),
    deviceUuid: uuidv4(),
  };

  return { ...defaultValues, ...overrideValues };
}

export function createCall(overrideValues: Partial<Call> = {}): Call {
  const defaultValues: Call = {
    uid: uuidv4(),
    displayName: getRandomString(),
    hostId: uuidv4(),
    hostDisplayName: getRandomString(),
  };

  return { ...defaultValues, ...overrideValues };
}

export function createCallUser(
  overrideValues: Partial<CallUser> = {}
): CallUser {
  const defaultValues: CallUser = {
    uid: uuidv4(),
    userUid: uuidv4(),
    userDisplayName: getRandomString(),
    joined: Date.now(),
  };

  return { ...defaultValues, ...overrideValues };
}

export function createCallParticipant(
  overrideValues: Partial<CallParticipant> = {}
): CallParticipant {
  const defaultValues: CallParticipant = {
    uid: uuidv4(),
    userUid: uuidv4(),
    userDisplayName: getRandomString(),
    joined: Date.now(),
  };

  return { ...defaultValues, ...overrideValues };
}

function getRandomString() {
  return Math.random().toString(36).substring(7);
}

function getRandomEmail() {
  return `${getRandomString()}@test.com`;
}
