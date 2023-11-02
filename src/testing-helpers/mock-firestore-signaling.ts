jest.mock("../services/signaling-backend.ts", () => ({
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
  askToJoinCall: jest.fn().mockResolvedValue(undefined),
  acceptPendingUser: jest.fn().mockResolvedValue(undefined),
  rejectPendingUser: jest.fn().mockResolvedValue(undefined),
  getIceServersConfig: jest.fn().mockResolvedValue({
    username: "dovahkiin",
    credential: "fus-ro-dah",
    urls: [
      "stun:foo.bar",
      "turn:foo.bar:80?transport=udp",
      "turn:foo.bar:3478?transport=udp",
      "turn:foo.bar:80?transport=tcp",
      "turn:foo.bar:3478?transport=tcp",
      "turns:foo.bar:443?transport=tcp",
      "turns:foo.bar:5349?transport=tcp",
    ],
  }),
}));
