import "@testing-library/jest-dom";

jest.mock("./src/services/firestore-infra/firestore-connection.ts", () => ({
  db: {},
}));

jest.mock("firebase/functions", () => ({
  getFunctions: jest.fn().mockReturnValue({}),
  httpsCallable: jest.fn().mockReturnValue({}),
}));
