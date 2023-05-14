import App from "./App";
import fullRender from "./testing-helpers/fullRender";

describe("App", () => {
  it("renders", () => {
    fullRender(<App />);
  });
});
