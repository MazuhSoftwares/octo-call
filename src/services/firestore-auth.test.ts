import "../testing-helpers/mock-firebase-auth";
import firestoreAuth from "./firestore-auth";
import * as firebaseAuth from "firebase/auth";

describe("firestoreAuth", () => {
  it("should successfully log in and return user information", async () => {
    jest.spyOn(firebaseAuth, "getAuth");
    jest.spyOn(firebaseAuth, "signInWithPopup");
    const user = await firestoreAuth.login();
    expect(user).toEqual({
      uid: "abc123def456",
      displayName: "Jane Doe",
      email: "jane@example.com",
    });
  });

  it("should block log in when user email is null", async () => {
    jest.spyOn(firebaseAuth, "getAuth");
    jest.spyOn(firebaseAuth, "signInWithPopup").mockResolvedValue({
      operationType: "signIn",
      providerId: "google.com",
      user: {
        providerId: "google.com",
        uid: "abc123def456",
        displayName: "Jane Doe",
        email: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        tenantId: "asdf123asdf",
        refreshToken: "qwer456qwer",
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        phoneNumber: "",
        photoURL: "",
      },
    });
    await expect(firestoreAuth.login()).rejects.toThrow(
      "Login blocked: unidentified user."
    );
  });

  it("should successfully log off without throwing an error", async () => {
    jest.spyOn(firebaseAuth, "getAuth");
    jest.spyOn(firebaseAuth, "signOut");
    await expect(firestoreAuth.logoff()).resolves.not.toThrow();
  });
});
