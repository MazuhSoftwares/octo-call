import type { Auth, AuthProvider } from "firebase/auth";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    Qc: ["client_id", "response_type", "scope", "redirect_uri", "state"],
    providerId: "google.com",
    isOAuthProvider: true,
    Jb: {},
    qb: "hl",
    pb: null,
    a: ["profile"],
  })),
  setPersistence: jest.fn(),
  browserLocalPersistence: jest.fn(),
  signInWithPopup: jest.fn((_: Auth, __: AuthProvider) =>
    Promise.resolve({
      operationType: "signIn",
      providerId: "google.com",
      user: {
        providerId: "google.com",
        uid: "abc123def456",
        displayName: "Jane Doe",
        email: "jane@example.com",
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
    })
  ),
  signOut: jest.fn((_: Auth) => Promise.resolve()),
}));
