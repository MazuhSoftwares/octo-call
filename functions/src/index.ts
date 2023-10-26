import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineString } from "firebase-functions/params";

export const getIceServersConfig = onCall(
  async (request): Promise<{ iceServersConfig: RTCIceServer }> => {
    if (!request.auth) {
      throw new HttpsError(
        "failed-precondition",
        "No authentication detected."
      );
    }

    const userEmail = request.auth.token.email;
    if (!request.auth.token.email) {
      throw new HttpsError("failed-precondition", "User with no email.");
    }

    logger.info("Retrieving ICE servers for", userEmail);

    try {
      const iceServersConfig = await fetchIceFromXirsys();
      return { iceServersConfig };
    } catch (error) {
      logger.error(
        "ICE provider error:",
        (error as Error).message || "(no message)"
      );
      throw new HttpsError(
        "unavailable",
        "No successful response from ICE server integration."
      );
    }
  }
);

async function fetchIceFromXirsys(): Promise<RTCIceServer> {
  const ident: string = defineString("XIRSYS_API_IDENT", {
    default: "",
    description: "Xirsys API user identification for retrieving ICE servers.",
  }).value();
  const secret: string = defineString("XIRSYS_API_SECRET", {
    default: "",
    description: "Xirsys API account secret for retrieving ICE servers.",
  }).value();
  const channel: string = defineString("XIRSYS_API_CHANNEL", {
    default: "",
    description: "Xirsys API channel name for retrieving ICE servers.",
  }).value();

  if (!secret || !ident || !channel) {
    throw new Error("Missing Xirsys API credentials.");
  }

  const response = await fetch(`https://global.xirsys.net/_turn/${channel}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${ident}:${secret}`).toString("base64"),
    },
    body: JSON.stringify({
      format: "urls",
    }),
  });
  const data = await response.json();

  if (data.s !== "ok") {
    throw new Error(data.v);
  }

  if (!data.v.iceServers) {
    // these "s" and "v" are weird, so lets just double check
    throw new Error(
      "Unknown content found in ICE server integration response."
    );
  }

  if (Array.isArray(data.v.iceServers)) {
    // the name is plural but it should not be an array
    throw new Error(
      "Unexpected array content found in ICE server integration response."
    );
  }

  return data.v.iceServers;
}
