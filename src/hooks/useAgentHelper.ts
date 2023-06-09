import { useRef } from "react";
import webrtc from "../webrtc";

export default function useAgentHelper(): typeof webrtc.agentHelpers {
  const agentHelpers = useRef(webrtc.agentHelpers);
  return agentHelpers.current;
}
