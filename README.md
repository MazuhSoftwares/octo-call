# Octo Call

Video conference app. A proof of concept.

## About it

It implements WebRTC Mesh Architecture.

This Mesh topology is a peer-to-peer communication model where each
participant in a group call communicates directly with every other participant
in the call. It eliminates the need for a central media server, although it
still needs some signaling server for connectivity establishment protocols.

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

## Setting up for deployment

It'll need Blaze plan active for the Firebase project. Just for testing,
its free limit should be enough even being a billable plan.

```sh
npm ci
firebase login
npm run deploy
```

It'll deploy the static client side code and bunch of serverless functions.

It needs a `.env.production` file in set too.

To achieve more stability for users in different network settings,
you'll also need to create ICE servers (STUN/TURN) using a proper CPaaS
that provides it like [Xirsys](https://global.xirsys.net/dashboard/services)
(it has a free plan for testing), [Twilio](https://www.twilio.com/docs/stun-turn)
or even [coTURN](https://github.com/coturn/coturn) (free source, but you'll
host it by yourself in your own infrastructure).

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

### Code architecture

Regarding user interface modules, the code is inspired by
[Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/).

Under `src/`, there should be some React-centric stuff:

- `components/*/`: Common React components, potentially used more than once,
  a few of them interacting with stateful modules. In Atomic Design,
  these would be _atoms_, _molecules_ and a few _templates_ (more below).

- `components/templates/`: Part of the components are meant to be the skeleton
  of pages and include a automatic routing rules. They accept features as
  their children. In Atomic Design, these would be called _templates_.

- `features/*/`: Each subfolder would be, in Atomic Design, _organisms_ and
  _pages_, the higher level of abstractions. They must be focused on the user
  interaction, not meant to be reused, and not meant to have complex technical
  details unless purely related to visual manipulation.

Some middlewares, sanitizing layers between React and the world:

- `state/`: The _single source of truth_ related to the application data, and
  thus a global provider powered by Redux Toolkit. It's made of _pure_ structures.

- `hooks/`: _Side effect_ providers. Deals with a lot of _mutable_ structures.
  It might relate itself with `state/` layer to synchronize data knowledge.

And the big source of side effects, isolated and agnostic to React:

- `services/`: For third-party connections and integrations, like
  authentication and WebRTC signaling. It shouldn't have any important
  business logic, so it must act more like an anti-corruption layer.
  Currently Firebase is the main service behind a lot of what's happening
  here, but the code design must be prepared for it to be easily replaced
  later.

- `webrtc/`: Directly handles native WebRTC API for gathering devices,
  user permissions, initializing P2P connections and so on. It must expose
  generic interfaces for the rest of the code safely use these features.

And auxiliary domains:

- `assets/`: for multimidia like pictures and sounds.

All UI code should always rely on `state/` and/or `hooks/` as middleware for
accessing `services/` and `webrtc/` layers. Only TypeScript interfaces and
types can have some (not full) degree of freedom between all layers.

WebRTC applications can get very complex very quickly, even in a small scope
like this. It's a chaotic combination of multiple side effects, non-linear
behaviors, several network protocols exposed at the same time, and often
sensible from Document race conditions to the mere location of devices.
Hence, having this minimal level of responsibilities assigned to each layer
is an important tool for the overall maintainability.

A reasonable code coverage is required to keep it all together. Because
there's a fairly complex client side code here, considering the
serverless (cloud) nature of the architecture.

### Browsers support

Supported mobile devices:

- iOS.
- Android.

And their browsers:

- Chrome.
- Firefox.
- Safari.

Only up-to-date versions.

Supported resolutions:

- ?

## Functional requirements

As a proof of concept, features are limited. But there's a try to follow
minimal standards discussed by industry vendors:
https://www.youtube.com/watch?v=EmI4QvicZTY

## License

This initiative is lead by
[Marcell (Mazuh) G. C. da Silva](https://github.com/Mazuh)
and it's under [MIT License](./LICENSE).
