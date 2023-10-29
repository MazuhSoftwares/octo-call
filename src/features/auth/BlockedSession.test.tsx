import "../../testing-helpers/mock-firestore-auth";
import { act } from "react-dom/test-utils";
import fullRender from "../../testing-helpers/fullRender";
import BlockedSession from "./BlockedSession";

describe("BlockedSession", () => {
  it("renders", async () => {
    await act(() => fullRender(<BlockedSession />));
  });
});
