import { useLocation } from "wouter";
import { useAppSelector } from "../state";
import { selectIsUserAuthenticated } from "../state/user";
import { selectCallUid, selectCallUserStatus } from "../state/call";

export default function useRedirectionRule(): string {
  const isUserAuthenticated = useAppSelector(selectIsUserAuthenticated);

  const callUserStatus = useAppSelector(selectCallUserStatus);
  const callUid = useAppSelector(selectCallUid);

  const [location] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const search: Record<string, string> = Array.from(
    searchParams.entries()
  ).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const context: RedirectionContext = {
    hasAuth: isUserAuthenticated,
    path: location,
    pendingCall: callUserStatus === "pending-user" ? callUid : "",
    ongoingCall: callUserStatus === "participant" ? callUid : "",
  };
  const goTo = getRedirectionRule(context, search);

  return goTo;
}

export interface RedirectionContext {
  path: string;
  hasAuth: boolean;
  pendingCall?: string;
  ongoingCall?: string;
}

export function getRedirectionRule(
  { path, hasAuth, pendingCall, ongoingCall }: RedirectionContext,
  search: Record<string, string>
): string {
  if (path === "/") {
    if (hasAuth && search.joining) {
      return `/join?callUid=${search.joining}`;
    }

    if (hasAuth && search.creating) {
      return `/create?callDisplayName=${search.creating}`;
    }

    if (hasAuth) {
      return "/create";
    }
  }

  if (path === "/create") {
    if (hasAuth && ongoingCall) {
      return `/p2p-call/${ongoingCall}`;
    }

    if (!hasAuth) {
      return "/";
    }
  }

  if (path === "/join") {
    if (pendingCall && hasAuth) {
      return "/pending";
    }

    if (search.callUid && hasAuth) {
      return "";
    }

    if (search.callUid && !hasAuth) {
      return `/?joining=${search.callUid}`;
    }

    if (!hasAuth) {
      return "/";
    }
  }

  if (path === "/pending") {
    if (pendingCall) {
      return "";
    }

    if (ongoingCall) {
      return `/p2p-call/${ongoingCall}`;
    }

    return "/";
  }

  if (path.startsWith("/p2p-call")) {
    const callUuid = path.replace("/p2p-call/", "");
    if (hasAuth && !ongoingCall && callUuid) {
      return `/join?callUid=${callUuid}`;
    }

    if (hasAuth && !ongoingCall) {
      return "/create";
      // return "/left";
    }

    if (!hasAuth && callUuid) {
      return `/join?callUid=${callUuid}`;
    }

    if (!hasAuth) {
      return "/";
    }
  }

  return "";
}
