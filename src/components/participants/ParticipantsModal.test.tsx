import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { callUsersInitialState } from "../../state/callUsers";
import {
  createCall,
  createCallParticipant,
  createCallUser,
} from "../../testing-helpers/call-fixtures";
import fullRender from "../../testing-helpers/fullRender";
import ParticipantsModal from "./ParticipantsModal";
import { act } from "react-dom/test-utils";
import { CallState, callInitialState } from "../../state/call";
import { userInitialState } from "../../state/user";

describe("ParticipantsModal", () => {
  const call: CallState = {
    ...callInitialState,
    ...createCall(),
    status: "inProgress",
  };

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it("renders", async () => {
    fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />);
    const participantsModal = await screen.findByRole("heading", {
      name: "Participants",
    });
    expect(participantsModal).toBeVisible();
  });

  it("displays the correct link text", () => {
    fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />, {
      preloadedState: { call },
    });
    expect(
      screen.getByText(
        window.location.href + "octo-call/join?callUid=" + call.uid
      )
    ).toBeVisible();
  });

  it("copies link to clipboard and shows success Snackbar on button click", async () => {
    fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />, {
      preloadedState: { call },
    });
    const copyButton = screen.getByRole("button", { name: "Copy" });

    await act(() => fireEvent.click(copyButton));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      window.location.href + "octo-call/join?callUid=" + call.uid
    );

    const successSnackbar = await waitFor(() => screen.getByRole("alert"));
    expect(successSnackbar).toHaveTextContent(
      "Call link copied to the clipboard."
    );
  });

  it("lists participants", async () => {
    const participant0 = createCallParticipant();
    const participant1 = createCallParticipant();

    await act(() =>
      fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />, {
        preloadedState: {
          callUsers: {
            ...callUsersInitialState,
            participants: [participant0, participant1],
          },
        },
      })
    );
    const list = screen.getByRole("list", {
      name: /Participants in call/i,
    });

    const items = within(list).getAllByRole("listitem");
    expect(items[0].textContent).toBe(participant0.userDisplayName);
    expect(items[1].textContent).toBe(participant1.userDisplayName);
  });

  it("doest alert absense of pending user", async () => {
    await act(() =>
      fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />, {
        preloadedState: {
          callUsers: {
            ...callUsersInitialState,
            participants: [createCallParticipant()],
          },
        },
      })
    );
    const list = screen.queryByRole("list", {
      name: /Pending users/i,
    });
    expect(list).toBe(null);
  });

  it("can list pending users", async () => {
    const pendingUser = createCallUser();

    await act(() =>
      fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />, {
        preloadedState: {
          call,
          callUsers: {
            ...callUsersInitialState,
            pendingUsers: [pendingUser],
          },
        },
      })
    );

    const list = screen.getByRole("list", {
      name: /Pending users/i,
    });
    const items = within(list).getAllByRole("listitem");
    expect(items[0].textContent).toBe(pendingUser.userDisplayName);
  });

  it("can accept and refuse buttons be shown to the host", async () => {
    const pendingUser = createCallUser();
    const currentUserUid = call.hostId;
    const currentUserDisplayName = call.hostDisplayName;

    await act(() =>
      fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />, {
        preloadedState: {
          call,
          user: {
            ...userInitialState,
            uid: currentUserUid,
            displayName: currentUserDisplayName,
          },
          callUsers: {
            ...callUsersInitialState,
            pendingUsers: [pendingUser],
          },
        },
      })
    );

    const list = screen.getByRole("list", {
      name: /Pending users/i,
    });
    const items = within(list).getAllByRole("listitem");
    const refuseButton = within(items[0]).getByRole("button", {
      name: "Not Allow",
    });
    const acceptButton = within(items[0]).getByRole("button", {
      name: "Allow",
    });
    expect(acceptButton).toBeInTheDocument();
    expect(refuseButton).toBeInTheDocument();
  });
});
