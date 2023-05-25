import { createCall } from "./firestore-signaling";
import { v4 as uuidv4 } from "uuid";

import { doc, writeBatch } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  writeBatch: jest.fn(),
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
      participantsUids: ["5g6h7j"],
    });

    expect(mockSet).toBeCalledTimes(2);
    expect(mockCommit).toBeCalledTimes(1);
  });

  it("returns the resulting call with uid", async () => {
    const result = await createCall({
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
      participantsUids: ["5g6h7j"],
    });

    expect(result.uid).toBe("first-e223-4e25-aaca-b7c0ffecd647");
  });

  it("should create call documents in Firebase", async () => {
    await createCall({
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
      participantsUids: ["5g6h7j"],
    });

    const [firstCall, secondCall] = mockSet.mock.calls;
    expect(firstCall[1]).toEqual({
      uid: "first-e223-4e25-aaca-b7c0ffecd647",
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
      participantsUids: ["5g6h7j"],
    });
    expect(secondCall[1]).toEqual({
      uid: "second-7390-4d50-91f3-abcdef1e0d50",
      userUid: "5g6h7j",
      userDisplayName: "John Doe",
    });

    const [firstDocCall, secondDocCall] = (doc as jest.Mock).mock.calls;
    expect(firstDocCall[1]).toBe("calls/first-e223-4e25-aaca-b7c0ffecd647");
    expect(secondDocCall[1]).toBe(
      "calls/first-e223-4e25-aaca-b7c0ffecd647/users/second-7390-4d50-91f3-abcdef1e0d50"
    );
  });
});
