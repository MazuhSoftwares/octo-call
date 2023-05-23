jest.mock("../services/firestore-signaling.ts", () => ({
  create: jest.fn().mockResolvedValue({
    uid: "1a2b3c",
    displayName: "Daily",
    hostId: "5g6h7j",
    hostDisplayName: "John Doe",
    participantsUids: ["5g6h7j"],
  }),
  createCall: jest.fn().mockResolvedValue({
    call: {
      uid: "1a2b3c",
      displayName: "Daily",
      hostId: "5g6h7j",
      hostDisplayName: "John Doe",
      participantsUids: ["5g6h7j"],
    },
    callUser: {
      uid: "kl34k3i4",
      userUid: "5g6h7j",
      userDisplayName: "John Doe",
    },
  }),
}));
