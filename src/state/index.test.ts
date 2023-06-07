import debounce from "lodash.debounce";
import {
  loadStateFromPersistence,
  handleStateUpdateForPersistence,
  getWorthingDiff,
  isFilledDiff,
  RootState,
  setupAppStore,
} from "./";
import {
  readFromPersistence,
  appendToPersistence,
} from "../services/persistence";
import { DevicesState, setUserAudioId } from "./devices";
import { devicesInitialState } from "./devices";

jest.mock("../services/persistence", () => ({
  readFromPersistence: jest.fn(),
  appendToPersistence: jest.fn(),
}));

jest.mock("lodash.debounce", () => jest.fn((f) => f));

describe.only("Persistence helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("readFromPersistence: loads the state correctly from persistence", async () => {
    const mockPersisted: Partial<DevicesState> = {
      userAudioId: "123-loaded-mock-321",
    };
    (readFromPersistence as jest.Mock).mockReturnValueOnce(mockPersisted);

    const loaded = loadStateFromPersistence();

    // this detail was overrided from persistence
    expect(loaded.devices?.userAudioId).toEqual("123-loaded-mock-321");
    // but the initial values are still there
    expect(loaded.devices?.userVideoId).toEqual("");
  });

  test("handleStateUpdateForPersistence: handles the state update for persistence correctly", () => {
    const notPersistedStore = setupAppStore({ persist: false });
    const mockPrevious: RootState = { ...notPersistedStore.getState() };
    const mockCurrent: RootState = {
      ...notPersistedStore.getState(),
      devices: {
        ...devicesInitialState,
        userAudioId: "my-favorite-new-microphone",
      },
    };

    handleStateUpdateForPersistence(mockPrevious, mockCurrent);

    expect(appendToPersistence).toHaveBeenCalledWith(
      window.localStorage,
      "devices",
      {
        userAudioId: "my-favorite-new-microphone",
      }
    );
  });

  test("handleStateUpdateForPersistence when having persist flag, calls I/O", async () => {
    (debounce as jest.Mock).mockImplementation((f) => f);
    (readFromPersistence as jest.Mock).mockReturnValue({});

    const persistingStore = setupAppStore({
      persist: true,
      preloadedState: {
        devices: {
          ...devicesInitialState,
          userAudioId: "",
          audioInputs: [
            {
              deviceId: "my-other-new-mic",
              kind: "audioinput",
              label: "My Other New Mic",
            },
          ],
        },
      },
    });

    persistingStore.dispatch(setUserAudioId("my-other-new-mic"));

    expect(readFromPersistence).toBeCalled();
    expect(appendToPersistence).toBeCalled();
  });

  test("getWorthingDiff: points out only updated data chunk if new was added", () => {
    expect(
      getWorthingDiff(
        {
          ...devicesInitialState,
          userAudioId: "some-old-device",
        },
        {
          ...devicesInitialState,
          userAudioId: "my-new-device",
        }
      )
    ).toEqual({
      userAudioId: "my-new-device",
    });
  });

  test("getWorthingDiff: is falsy safe", () => {
    expect(
      getWorthingDiff(undefined, {
        ...devicesInitialState,
        userAudioId: "my-new-device",
      })
    ).toEqual({
      ...devicesInitialState,
      userAudioId: "my-new-device",
    });
  });

  test("isFilledDiff: returns true if diff has data", () => {
    expect(
      isFilledDiff({
        userAudioId: "my-new-device",
      })
    ).toBe(true);
  });

  test("isFilledDiff: returns false if diff is empty object", () => {
    expect(isFilledDiff({})).toBe(false);
  });
});
