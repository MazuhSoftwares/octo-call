import "../testing-helpers/mock-firebase-auth";
import firestoreAuth from "./firestore-auth";
import * as firebaseAuth from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  onSnapshot: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

jest.mock("./firestore-connection", () => ({
  db: jest.fn(),
}));

describe("firestoreAuth", () => {
  beforeEach(() => {
    (uuidv4 as jest.Mock).mockReturnValueOnce("7390-4d50-91f3-abcdef1e0d50");
  });
  it("should successfully log in and return user information", async () => {
    jest.spyOn(firebaseAuth, "getAuth");
    jest.spyOn(firebaseAuth, "getRedirectResult");
    (doc as jest.Mock).mockImplementationOnce((_, path) => path);
    (setDoc as jest.Mock).mockResolvedValueOnce(Promise.resolve(null));
    await firestoreAuth.login();
    const user = await firestoreAuth.loadUser();
    expect(user).toEqual({
      uid: "abc123def456",
      displayName: "Jane Doe",
      email: "jane@example.com",
      deviceUuid: "7390-4d50-91f3-abcdef1e0d50",
    });
  });

  it("should block log in when user email is null", async () => {
    jest.spyOn(firebaseAuth, "getAuth");
    jest.spyOn(firebaseAuth, "getRedirectResult").mockResolvedValue({
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
    await expect(firestoreAuth.loadUser()).rejects.toThrow(
      "Login blocked: unidentified user."
    );
  });

  it("should successfully log off without throwing an error", async () => {
    jest.spyOn(firebaseAuth, "getAuth");
    jest.spyOn(firebaseAuth, "signOut");
    await expect(firestoreAuth.logout()).resolves.not.toThrow();
  });
});

describe("listenUserSession", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("listenUserSession will notify the callback on each snapshot invocation", async () => {
    const mockUserUid = "zJTvoYDGr9PuN1z69vheO0b4iWF2";
    (onSnapshot as jest.Mock).mockImplementation((_, onNext) =>
      onNext({
        forEach: Array.prototype.forEach.bind([
          {
            id: mockUserUid,
            data: () => ({
              deviceUuid: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
            }),
          },
        ]),
      })
    );

    const mockCallback = jest.fn();
    firestoreAuth.listenUserSession(mockUserUid, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith({
      deviceUuid: "6db9ad2e-19f9-4a85-b383-7731e347b7d0",
    });
  });
});
