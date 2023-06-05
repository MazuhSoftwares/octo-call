import { PreloadedAppState } from "../../state";
import { callUsersInitialState } from "../../state/callUsers";
import fullRender from "../../testing-helpers/fullRender";
import ParticipantsModal from "./ParticipantsModal";

describe("ParticipantsModal", () => {
  const preloadedState: PreloadedAppState = {
    callUsers: {
      ...callUsersInitialState,
      participants: [
        {
          uid: "c2a35f1f-46ea-4dab-a476-505a4b1b1c95",
          userUid: "UOpsZn96IJUn8Jc2c8YFIcGRpzj1",
          userDisplayName: "Jane Doe",
        },
      ],
    },
  };

  it("renders", () => {
    fullRender(<ParticipantsModal isOpen={true} close={jest.fn()} />, {
      preloadedState,
    });
  });
});
