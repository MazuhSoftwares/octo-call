jest.mock("../services/firestore-crud.ts", () => ({
  create: jest.fn().mockResolvedValue({
    uid: "1a2b3c",
    displayName: "Daily",
    hostId: "5g6h7j",
    hostDisplayName: "John Doe",
    participantsUids: ["5g6h7j"],
  }),
}));
