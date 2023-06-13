import { act, screen } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import PendingUserMain from "./PendingUserMain";
import { callInitialState } from "../../state/call";
import { createCall } from "../../testing-helpers/call-fixtures";

jest.mock("../../hooks/useCallUsersListener", () => jest.fn());

describe("PendingUserMain", () => {
  it("identifies pending call and has an option available to cancel it", async () => {
    await act(() =>
      fullRender(<PendingUserMain />, {
        preloadedState: {
          call: {
            ...callInitialState,
            ...createCall({ uid: "123-call-uid-321" }),
          },
        },
      })
    );

    expect(screen.getByText("123-call-uid-321")).toBeVisible();

    expect(
      screen.getByRole("button", { name: "Cancel pending call" })
    ).toBeVisible();
  });
});
