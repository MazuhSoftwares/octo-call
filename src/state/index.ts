import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";
import get from "lodash.get";
import debounce from "lodash.debounce";
import {
  retrieveDevicesState,
  saveDevicesState,
} from "../services/persistence-states";
import user from "./user";
import devices, { devicesInitialState } from "./devices";
import call from "./call";

const rootReducer = combineReducers({
  user,
  devices,
  call,
});

export type PreloadedAppState = PreloadedState<RootState>;

export interface SetupAppStoreOptions {
  preloadedState?: PreloadedAppState;
  persist?: boolean;
}

export const setupAppStore = (options: SetupAppStoreOptions = {}) => {
  const creatingStore = configureStore({
    reducer: rootReducer,
    preloadedState: options.persist
      ? loadStateFromPersistence(options?.preloadedState)
      : options.preloadedState,
  });

  if (options.persist) {
    configurePersistenceListener(creatingStore);
  }

  return creatingStore;
};

export const store = setupAppStore({ persist: true });

export type RootState = ReturnType<typeof rootReducer>;

export type AppStore = ReturnType<typeof setupAppStore>;

export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function configurePersistenceListener(configuringStore: AppStore) {
  console.log("Persistence configured as store listener.");

  let current: RootState;

  configuringStore.subscribe(
    debounce(() => {
      try {
        const previous = current;

        current = configuringStore.getState();

        if (previous == current) {
          return;
        }

        handleStateUpdateForPersistence(previous, current);
      } catch (error) {
        console.error("Error on Redux subscription for persistence.", error);
      }
    }, 150)
  );
}

export function loadStateFromPersistence(
  preloaded: PreloadedAppState = {}
): PreloadedAppState {
  console.log("Loading state from persistence.");
  const preloading: PreloadedAppState = { ...preloaded };

  preloading.devices = {
    ...devicesInitialState,
    ...(preloaded.devices || {}),
    ...retrieveDevicesState(),
  };

  console.log("Loaded state from persistence.");
  return preloading;
}

export function handleStateUpdateForPersistence(
  previous: RootState,
  current: RootState
): void {
  const devicesDiff = getWorthingDiff(
    previous?.devices || {},
    current.devices,
    {
      deny: [
        "audioStatus",
        "audioErrorMessage",
        "videoStatus",
        "videoErrorMessage",
      ],
    }
  );
  if (isFilledDiff(devicesDiff)) {
    saveDevicesState(devicesDiff);
  }
}

export function getWorthingDiff<T extends RootState[keyof RootState]>(
  previous: T | undefined,
  current: T | undefined,
  options: {
    allow?: (keyof T)[];
    deny?: (keyof T)[];
  } = {}
): Partial<T> {
  if (!previous || !current) {
    return current || {};
  }

  const all = new Set<keyof T>([
    ...(Object.keys(previous) as (keyof T)[]),
    ...(Object.keys(current) as (keyof T)[]),
  ]);
  const allowed = options.allow ? new Set<keyof T>(options.allow) : all;
  const denied = options.deny ? new Set<keyof T>(options.deny) : new Set();

  const worthingCurrentDiff: Partial<T> = Array.from(all.values()).reduce(
    (acc, key) => {
      if (!key || !allowed.has(key) || denied.has(key)) {
        return acc;
      }

      const previousValue = get(previous, key);
      const currentValue = get(current, key);
      if (previousValue === currentValue) {
        return acc;
      }

      return { ...acc, [key]: currentValue };
    },
    {}
  );

  return worthingCurrentDiff;
}

export function isFilledDiff<T extends RootState[keyof RootState]>(
  diff: Partial<T>
): boolean {
  return Object.keys(diff).length > 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).debugState = store.getState;
