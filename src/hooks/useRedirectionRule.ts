import { useLocation } from "wouter";
import { useAppSelector } from "../state";
import { selectIsUserAuthenticated } from "../state/user";
import { selectCallUid, selectHasCallInProgress } from "../state/call";

export default function useRedirectionRule(): string {
  const isUserAuthenticated = useAppSelector(selectIsUserAuthenticated);

  const callInProgress = useAppSelector(selectHasCallInProgress);
  const callUid = useAppSelector(selectCallUid);

  const [location] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const search: Record<string, string> = Array.from(
    searchParams.entries()
  ).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const context = {
    hasAuth: isUserAuthenticated,
    path: location,
    ongoingCall: callInProgress ? callUid : "",
  };
  const goTo = getRedirectionRule(context, search);
  // console.log("from", location, "to", goTo, "ctx", context, "search", search);
  return goTo;
}

export function getRedirectionRule(
  {
    path,
    hasAuth,
    ongoingCall,
  }: { path: string; hasAuth: boolean; ongoingCall?: string },
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

  if (path.startsWith("/p2p-call")) {
    if (hasAuth && !ongoingCall) {
      return "/create";
      // return "/left";
    }

    if (!hasAuth) {
      return "/";
    }
  }

  return "";
}
