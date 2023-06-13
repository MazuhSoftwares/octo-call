import {
  askToJoinCall,
  createCall,
  listenCallUsers,
} from "./firestore-signaling";
import { v4 as uuidv4 } from "uuid";

import {
  doc,
  writeBatch,
  onSnapshot,
  getDocs,
  setDoc,
} from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  writeBatch: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  where: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

jest.mock("./firestore-connection", () => ({
  db: jest.fn(),
}));

describe("createCall", () => {
  const mockSet = jest.fn();
  const mockCommit = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (uuidv4 as jest.Mock)
      .mockReturnValueOnce("first-e223-4e25-aaca-b7c0ffecd647")
      .mockReturnValueOnce("second-7390-4d50-91f3-abcdef1e0d50");

    (writeBatch as jest.Mock).mockReturnValue({
      set: mockSet,
      commit: mockCommit,
    });
    mockCommit.mockResolvedValue(true);
  });

  it("is atomic", async () => {
    await createCall({
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
    });

    expect(mockSet).toBeCalledTimes(2);
    expect(mockCommit).toBeCalledTimes(1);
  });

  it("returns the resulting call with uid", async () => {
    const result = await createCall({
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
    });

    expect(result.uid).toBe("first-e223-4e25-aaca-b7c0ffecd647");
  });

  it("should create call and call user documents in Firebase", async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 5, 5, 7));
    await createCall({
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
    });

    const [firstCall, secondCall] = mockSet.mock.calls;
    expect(firstCall[1]).toEqual({
      uid: "first-e223-4e25-aaca-b7c0ffecd647",
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
    });
    expect(secondCall[1]).toEqual({
      uid: "5g6h7j",
      userUid: "5g6h7j",
      userDisplayName: "John Doe",
      joined: Date.now(),
    });

    const [firstDocCall, secondDocCall] = (doc as jest.Mock).mock.calls;
    expect(firstDocCall[1]).toBe("calls/first-e223-4e25-aaca-b7c0ffecd647");
    expect(secondDocCall[1]).toBe(
      "calls/first-e223-4e25-aaca-b7c0ffecd647/users/5g6h7j" // same ending as the user uid
    );
  });
});

describe("listenCallUsers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("listenCallUsers will notify the callback on each snapshop invokation", () => {
    (onSnapshot as jest.Mock).mockImplementation((_, onNext) =>
      onNext({
        forEach: Array.prototype.forEach.bind([
          {
            id: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
            data: () => ({
              joined: 1685587182349,
              userDisplayName: "Rodrigo Muniz",
              userUid: "zJTvoYDGr9PuN1z69vheO0b4iWF2",
              uid: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
            }),
          },
          {
            id: "D8LBvBhKb4ZidKKBWvvV",
            data: () => ({
              userUid: "a1s2d3",
              userDisplayName: "Marcell",
              joined: 1685587305764,
              uid: "D8LBvBhKb4ZidKKBWvvV",
            }),
          },
        ]),
      })
    );

    const mockCallUid = "mock-call-uid";
    const mockCallback = jest.fn();
    listenCallUsers(mockCallUid, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith([
      {
        joined: 1685587182349,
        userDisplayName: "Rodrigo Muniz",
        userUid: "zJTvoYDGr9PuN1z69vheO0b4iWF2",
        uid: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
      },
      {
        userUid: "a1s2d3",
        userDisplayName: "Marcell",
        joined: 1685587305764,
        uid: "D8LBvBhKb4ZidKKBWvvV",
      },
    ]);
  });
});

describe("askToJoinCall", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("askToJoinCall should create a callUser in firebase", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: Array.prototype.forEach.bind([
        {
          data: () => ({
            displayName: "Planing",
            hostId: "zJTvoYDGr9PuN1z69vheO0b4iWF2",
            uid: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
          }),
        },
      ]),
    });

    (doc as jest.Mock).mockImplementationOnce((_, path) => path);
    (setDoc as jest.Mock).mockResolvedValueOnce(Promise.resolve(null));

    await askToJoinCall({
      callUid: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
      userDisplayName: "Michael Smith",
      userUid: "zJTvoYDGr9PuN1z69vheO0b4iWF2",
    });

    const setDocCall = (setDoc as jest.Mock).mock.calls[0];

    expect(setDocCall[0]).toBe(
      "calls/6db9ad2e-19f9-4a85-b383-7731e347b7d0/users"
    );
    expect(setDocCall[1]).toEqual({
      uid: "zJTvoYDGr9PuN1z69vheO0b4iWF2", // same as the user uid
      userDisplayName: "Michael Smith",
      userUid: "zJTvoYDGr9PuN1z69vheO0b4iWF2",
    });
  });

  it("askToJoinCall should throw error when the call does not exist", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: Array.prototype.forEach.bind([]),
    });

    await expect(
      askToJoinCall({
        callUid: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
        userDisplayName: "Michael Smith",
        userUid: "zJTvoYDGr9PuN1z69vheO0b4iWF2",
      })
    ).rejects.toThrow("Call not found");
  });
});
