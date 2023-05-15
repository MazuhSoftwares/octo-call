import "./testing-helpers/mock-firestore-auth";
import App from "./App";
import fullRender from "./testing-helpers/fullRender";
import { act } from "react-dom/test-utils";

describe("App", () => {
  it("renders", async () => {
    await act(() => fullRender(<App />));
  });
});
