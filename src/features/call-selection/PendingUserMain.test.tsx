import { act, fireEvent, screen } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import PendingUserMain from "./PendingUserMain";
import { CallState, callInitialState, setCallUsers } from "../../state/call";
import {
  createCall,
  createCallUser,
} from "../../testing-helpers/call-fixtures";
import { UserState, userInitialState } from "../../state/user";

jest.mock("../../hooks/useRedirectionRule", () =>
  jest.fn().mockReturnValue("")
);

jest.mock("../../hooks/useCallUsersListener", () => jest.fn());

describe("PendingUserMain", () => {
  const callUserData = createCallUser({
    userDisplayName: "Ghost, Human Resources",
  });

  const user: UserState = {
    ...userInitialState,
    uid: callUserData.uid,
    displayName: callUserData.userDisplayName,
    email: "ghost@hr.com",
    status: "authenticated",
  };

  const call: CallState = {
    ...callInitialState,
    ...createCall({
      uid: "123-call-uid-321",
      hostId: "host-123",
      hostDisplayName: "Jane D.",
      displayName: "1:1 Jane Doe + John Doe",
    }),
    pendingUsers: [callUserData],
    userStatus: "pending-user",
  };

  it("identifies pending call", async () => {
    await act(() =>
      fullRender(<PendingUserMain />, {
        preloadedState: { user, call },
      })
    );

    expect(screen.getByText("123-call-uid-321")).toBeVisible();
  });

  it("can cancel the pending call", async () => {
    const { store } = await act(() =>
      fullRender(<PendingUserMain />, {
        preloadedState: { user, call },
      })
    );

    const cancelBtn = screen.getByRole("button", {
      name: "Cancel pending call",
    });
    await act(() => fireEvent.click(cancelBtn));

    expect(store.getState().call.uid).toBe("");
    expect(store.getState().call.userStatus).toBe("idle");
  });

  it("will consider a rejection if the user is removed from call lists", async () => {
    const { store } = await act(() =>
      fullRender(<PendingUserMain />, {
        preloadedState: { user, call },
      })
    );

    await act(() => store.dispatch(setCallUsers([])));

    expect(store.getState().call.uid).toBe("");
    expect(store.getState().call.userStatus).toBe("idle");
  });
});
