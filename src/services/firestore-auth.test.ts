import firestoreAuth from "./firestore-auth";

describe("firestoreAuth", () => {
  it("should successfully log in and return user information", async () => {
    const user = await firestoreAuth.login();
    expect(user).toEqual({
      uid: "abc123def456",
      displayName: "Jane Doe",
      email: "jane@example.com",
    });
  });

  it("should successfully log off without throwing an error", async () => {
    await expect(firestoreAuth.logoff()).resolves.not.toThrow();
  });
});
