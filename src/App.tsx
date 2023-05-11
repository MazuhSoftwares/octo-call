import "./App.css";
import { CurrentUserStateIndicator } from "./features/auth/CurrentUserStateIndicator";
import { useAppSelector } from "./state";
import { selectCurrentUser } from "./state/user";
import AudioInputSelector from "./ui/AudioInputSelector";
import VideoInputSelector from "./ui/VideoInputSelector";

export default function App() {
  const user = useAppSelector(selectCurrentUser);
  const userName = user.displayName || "World";

  return (
    <>
      <h1>{`Hello, ${userName}.`}</h1>
      <CurrentUserStateIndicator />
      <AudioInputSelector />
      <br />
      <VideoInputSelector />
    </>
  );
}
