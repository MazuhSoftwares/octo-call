# Octo Call

Video conference app. A proof of concept.

## About it

It implements WebRTC Mesh Architecture.

This Mesh topology is a peer-to-peer communication model where each
participant in a group call communicates directly with every other participant
in the call. It eliminates the need for a central media server.

That's somewhat good for privacy, latency and infrastructure costs, but it
implies exponential complexity on client side. That said, it's a bad
choice for production apps with larger a amount of participants, due to its
inheriting limitations on scalability, security, complexity, and reliability.

But remember, this is just a proof of concept of WebRTC knowledge, and is
supposed to be of cheap maintenance. So that's good enough. You can learn more
about it on
[WebRTC.Ventures](https://webrtc.ventures/2021/06/webrtc-mesh-architecture/)
and [BlogGeek.me](https://bloggeek.me/webrtc-p2p-mesh/) posts.
They're also awesome vendors in this field.

## Setting up for local development

### Client code

Using **Node 18**, clone this repository and install its dependencies:

```sh
npm install
```

And start the development server:

```sh
npm start
```

Read the output. Your local environment should be now ready to be
opened in your browser. While Chrome would be the best option,
it really should be working on other major modern browsers as well.

### Signaling server

The signaling server in this case is Firestore. It's a cloud
serverless approach for sharing realtime data.

First, setup up your cloud environment:

- Go to [Firebase Console](https://console.firebase.google.com/).
- Create a new project for you to store your testing Octo Call data
  (no need of Analytics).
- Create credentials for Web and it'll output your Firebase config values.
- Create a `.env.development.local` with your data, but
  following `.env.development.sample` structure.
- On Firebase Console, go to "Authentication" menu option,
  and enable Google authentication provider.
- On Firebase Console, go to "Firestore Database" menu option,
  and create one for you (in "testing mode" for local tests).

Restart your development server so they can load.

### Testing

For tests, you can run:

```
npm test
```

Or its variant for a live testing experience:

```sh
npm run test:watch
```

Happy coding!

## More non-functional requirements

### Technology stack

Following the "low budget approach" by design, here's the stack:

- Only client side rendering with React without framework.
- Material UI as base components library.
- Realtime signaling with Firebase (while the media is still peer-to-peer).
- TypeScript and Jest for code integrity.

In theory, the WebRTC portion could be used as a library for another UI,
and the signaling server could be replaced too. But having Mesh topology
is a major assumption for all the project layers.

### Folders architecture

Regarding user interface modules, the code is inspired by
[Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/).

Under `src/`, there should be:

- `features/`: Each subfolder would be a feature domain,
  with its local state and its private components. In Atomic Design,
  these would be pages and organisms.

- `components/`: common React components potentially used more than once,
  a few of them interacting with stateful modules. In Atomic Design,
  these would be atoms, molecules and a few templates.

- `state/`: global state structures. Heavy business logic, but made of pure
  functions, relying on integration with services and WebRTC layers to
  decouple side effects.

- `services/`: for third-party connections and integrations. Currently
  Firebase is the big service behind a lot of what's happening, but
  the code desing must be prepared for it to be easily replaced later.

- `webrtc/`: directly handles native WebRTC API for gathering devices,
  permissions, initializing P2P connections and such, exposing generic
  interfaces for the rest of the code. This folder must be agnositc to
  all other layers (including React itself).

- `assets/`: for multimidia like pictures and sounds.

The `services/` and `webrtc/` layers must never be accessed directly by the
UI, it should always rely on `state/` as middleware.

A reasonable code coverage is required to keep it all together, as there's a
fairly complex frontend code here.

### Browsers support

Supported mobile devices:

- iOS.
- Android.

And their browsers:

- Chrome.
- Firefox.
- Safari.

Only up-to-date versions.

## Features

As a proof of concept, features are limited. But there's a try to follow
minimal standards discussed by industry vendors:
https://www.youtube.com/watch?v=EmI4QvicZTY

## License

This a project lead by
[Marcell (Mazuh) G. C. da Silva](https://github.com/Mazuh)
and it's under [MIT License](./LICENSE).
