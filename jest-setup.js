import "@testing-library/jest-dom";

jest.mock("./src/services/firestore-connection.ts", () => ({
  db: {},
}));
