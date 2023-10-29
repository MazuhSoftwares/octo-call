import { getRedirectionRule } from "./useRedirectionRule";

describe("getRedirectionRule: / (auth)", () => {
  it("when authenticated, go to creation", () => {
    const result = getRedirectionRule(
      { path: "/", hasAuth: true, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("/create");
  });

  it("when not authenticated, stay here for auth", () => {
    const result = getRedirectionRule(
      { path: "/", hasAuth: false, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("");
  });

  it("when autenticated and provided joining uid, then go to join page proceed to device testing", () => {
    const result = getRedirectionRule(
      { path: "/", hasAuth: true, isSessionBlocked: false },
      { joining: "123-321" }
    );
    expect(result).toBe("/join?callUid=123-321");
  });

  it("when autenticated and provided creating display name, then go to create page proceed to device testing", () => {
    const result = getRedirectionRule(
      { path: "/", hasAuth: true, isSessionBlocked: false },
      { creating: "Daily" }
    );
    expect(result).toBe("/create?callDisplayName=Daily"); // TODO: names with special characters?
  });
});

describe("getRedirectionRule: /create", () => {
  it("when not authenticated, then go back to root for login", () => {
    const result = getRedirectionRule(
      { path: "/create", hasAuth: false, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("/");
  });

  it("when authenticated, stay here for device testing and call creation", () => {
    const result = getRedirectionRule(
      { path: "/create", hasAuth: true, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("");
  });

  it("when authenticated and has ongoing call, go to its page", () => {
    const result = getRedirectionRule(
      {
        path: "/create",
        hasAuth: true,
        ongoingCall: "123-321",
        isSessionBlocked: false,
      },
      {}
    );
    expect(result).toBe("/p2p-call/123-321");
  });

  it("when session is blocked, got to blocked session page", () => {
    const result = getRedirectionRule(
      {
        path: "/create",
        hasAuth: true,
        ongoingCall: "123-321",
        isSessionBlocked: true,
      },
      {}
    );
    expect(result).toBe("/blocked-session");
  });
});

describe("getRedirectionRule: /join", () => {
  it("when authenticated and provided call uid, then stay here for device testing", () => {
    const result = getRedirectionRule(
      { path: "/join", hasAuth: true, isSessionBlocked: false },
      { callUid: "123-321" }
    );
    expect(result).toBe("");
  });

  it("when not authenticated but provided call uid, then go authenticate", () => {
    const result = getRedirectionRule(
      { path: "/join", hasAuth: false, isSessionBlocked: false },
      { callUid: "123-321" }
    );
    expect(result).toBe("/?joining=123-321");
  });

  it("when not authenticated nor provided call uid, then start reset entire flow (came here by mistake?)", () => {
    const result = getRedirectionRule(
      { path: "/join", hasAuth: false, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("/");
  });

  it("when authenticated and didnt provide call uid, then stay to manually type it", () => {
    const result = getRedirectionRule(
      { path: "/join", hasAuth: true, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("");
  });

  it("when authenticated and has pending call, go to pending user page", () => {
    const result = getRedirectionRule(
      {
        path: "/join",
        hasAuth: true,
        pendingCall: "123-call-321",
        isSessionBlocked: false,
      },
      {}
    );
    expect(result).toBe("/pending");
  });

  it("when session is blocked, got to blocked session page", () => {
    const result = getRedirectionRule(
      {
        path: "/join",
        hasAuth: true,
        pendingCall: "123-call-321",
        isSessionBlocked: true,
      },
      {}
    );
    expect(result).toBe("/blocked-session");
  });
});

describe("getRedirectionRule: /join", () => {
  it("if has pending call, stay waiting", () => {
    const result = getRedirectionRule(
      {
        path: "/pending",
        hasAuth: true,
        pendingCall: "123-call-321",
        isSessionBlocked: false,
      },
      {}
    );
    expect(result).toBe("");
  });

  it("if has ongoing call, go for it", () => {
    const result = getRedirectionRule(
      {
        path: "/pending",
        hasAuth: true,
        ongoingCall: "123-call-321",
        isSessionBlocked: false,
      },
      {}
    );
    expect(result).toBe("/p2p-call/123-call-321");
  });

  it("if has none, reset navigation flow", () => {
    const result = getRedirectionRule(
      { path: "/pending", hasAuth: true, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("/");
  });

  it("when not authenticated, reset navigation flow", () => {
    const result = getRedirectionRule(
      { path: "/pending", hasAuth: false, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("/");
  });

  it("when session is blocked, got to blocked session page", () => {
    const result = getRedirectionRule(
      { path: "/pending", hasAuth: true, isSessionBlocked: true },
      {}
    );
    expect(result).toBe("/blocked-session");
  });
});

describe("getRedirectionRule: /p2p-call", () => {
  it("when authenticated with ongoing call, then stay here", () => {
    const result = getRedirectionRule(
      {
        path: "/p2p-call/123-321",
        hasAuth: true,
        ongoingCall: "123-321",
        isSessionBlocked: false,
      },
      {}
    );
    expect(result).toBe("");
  });

  it("when authenticated without ongoing call, go to a page saying good bye", () => {
    const result = getRedirectionRule(
      { path: "/p2p-call/123-321", hasAuth: true, isSessionBlocked: false },
      {}
    );
    // expect(result).toBe("/left");
    expect(result).toBe("/create");
  });

  it("when not authenticated and the url has call uuid, then go to join page", () => {
    // TODO: retrieve attempt call uid and convert into "/?joining=" flow
    const result = getRedirectionRule(
      { path: "/p2p-call/123-321", hasAuth: false, isSessionBlocked: false },
      {}
    );
    expect(result).toBe("/join?callUid=123-321");
  });

  it("when not authenticated and the url has not call uuid, be forced to reset flow", () => {
    const result = getRedirectionRule(
      { path: "/p2p-call/", hasAuth: false },
      {}
    );
    expect(result).toBe("/");
  });

  it("when session is blocked, got to blocked session page", () => {
    const result = getRedirectionRule(
      { path: "/p2p-call/123-321", hasAuth: false, isSessionBlocked: true },
      {}
    );
    expect(result).toBe("/blocked-session");
  });
});
