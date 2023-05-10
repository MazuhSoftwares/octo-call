const firestoreAuth = {
  login,
  logoff,
};

export default firestoreAuth;

async function login() {
  // TODO: implement real thing.
  await new Promise((r) => setTimeout(r, 1000));
  return {
    uid: "abc123def456",
    displayName: "Jane Doe",
    email: "jane@example.com",
  };
}

async function logoff() {
  // TODO: implement real thing.
}
