import type { DevicesState } from "../state/devices";
import { readFromPersistence, appendToPersistence } from "./persistence";

export function retrieveDevicesState(): DevicesState | null {
  return readFromPersistence<DevicesState>(DEVICES_STORAGE, DEVICES_KEY);
}

export function saveDevicesState(state: Partial<DevicesState>): boolean {
  return appendToPersistence(DEVICES_STORAGE, DEVICES_KEY, state);
}

const DEVICES_STORAGE = window.localStorage;
const DEVICES_KEY = "devices";
