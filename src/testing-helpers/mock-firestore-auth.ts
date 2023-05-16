jest.mock("../services/firestore-auth.ts", () => ({
  login: jest.fn().mockResolvedValue({
    uid: "abc123def456",
    displayName: "Jane Doe",
    email: "jane@example.com",
  }),
  logout: jest.fn().mockResolvedValue(null),
  loadUser: jest
    .fn()
    .mockResolvedValue({ uid: "", displayName: "", email: "" }),
}));
