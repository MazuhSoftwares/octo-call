import { getRedirectionRule } from "./useRedirectionRule";

describe("getRedirectionRule: / (auth)", () => {
  it("when authenticated, go to creation", () => {
    const result = getRedirectionRule({ path: "/", hasAuth: true }, {});
    expect(result).toBe("/create");
  });

  it("when not authenticated, stay here for auth", () => {
    const result = getRedirectionRule({ path: "/", hasAuth: false }, {});
    expect(result).toBe("");
  });

  it("when autenticated and provided joining uid, then go to join page proceed to device testing", () => {
    const result = getRedirectionRule(
      { path: "/", hasAuth: true },
      { joining: "123-321" }
    );
    expect(result).toBe("/join?callUid=123-321");
  });

  it("when autenticated and provided creating display name, then go to create page proceed to device testing", () => {
    const result = getRedirectionRule(
      { path: "/", hasAuth: true },
      { creating: "Daily" }
    );
    expect(result).toBe("/create?callDisplayName=Daily"); // TODO: names with special characters?
  });
});

describe("getRedirectionRule: /create", () => {
  it("when not authenticated, then go back to root for login", () => {
    const result = getRedirectionRule({ path: "/create", hasAuth: false }, {});
    expect(result).toBe("/");
  });

  it("when authenticated, stay here for device testing and call creation", () => {
    const result = getRedirectionRule({ path: "/create", hasAuth: true }, {});
    expect(result).toBe("");
  });

  it("when authenticated and has ongoing call, go to its page", () => {
    const result = getRedirectionRule(
      { path: "/create", hasAuth: true, ongoingCall: "123-321" },
      {}
    );
    expect(result).toBe("/p2p-call/123-321");
  });
});

describe("getRedirectionRule: /join", () => {
  it("when authenticated and provided call uid, then stay here for device testing", () => {
    const result = getRedirectionRule(
      { path: "/join", hasAuth: true },
      { callUid: "123-321" }
    );
    expect(result).toBe("");
  });

  it("when not authenticated but provided call uid, then go authenticate", () => {
    const result = getRedirectionRule(
      { path: "/join", hasAuth: false },
      { callUid: "123-321" }
    );
    expect(result).toBe("/?joining=123-321");
  });

  it("when not authenticated nor provided call uid, then start reset entire flow (came here by mistake?)", () => {
    const result = getRedirectionRule({ path: "/join", hasAuth: false }, {});
    expect(result).toBe("/");
  });

  it("when authenticated and didnt provide call uid, then stay to manually type it", () => {
    const result = getRedirectionRule({ path: "/join", hasAuth: true }, {});
    expect(result).toBe("");
  });
});

describe("getRedirectionRule: /p2p-call", () => {
  it("when authenticated with ongoing call, then stay here", () => {
    const result = getRedirectionRule(
      { path: "/p2p-call/123-321", hasAuth: true, ongoingCall: "123-321" },
      {}
    );
    expect(result).toBe("");
  });

  it("when authenticated without ongoing call, go to a page saying good bye", () => {
    const result = getRedirectionRule(
      { path: "/p2p-call/123-321", hasAuth: true },
      {}
    );
    // expect(result).toBe("/left");
    expect(result).toBe("/create");
  });

  it("when not authenticated, be forced to reset flow", () => {
    // TODO: retrieve attempt call uid and convert into "/?joining=" flow
    const result = getRedirectionRule(
      { path: "/p2p-call/123-321", hasAuth: false },
      {}
    );
    expect(result).toBe("/");
  });
});
