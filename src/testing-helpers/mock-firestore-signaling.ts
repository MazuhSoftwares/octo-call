jest.mock("../services/firestore-signaling.ts", () => ({
  create: jest.fn().mockResolvedValue({
    uid: "1a2b3c",
    displayName: "Daily",
    hostId: "5g6h7j",
    hostDisplayName: "John Doe",
  }),
  createCall: jest.fn().mockResolvedValue({
    uid: "1a2b3c",
    displayName: "Daily",
    hostId: "5g6h7j",
    hostDisplayName: "John Doe",
  }),
  listenCallUsers: jest.fn().mockReturnValue(jest.fn()),
}));
