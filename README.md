# Octo Call

> Video conference app. A proof of concept.

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
and [BlogGeek.me](https://bloggeek.me/webrtcglossary/mesh/) posts.
They're also awesome vendors in this field.

## Setting up for local development

### Client code

Using Node 18, clone this repository and install its dependencies:

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
- Create a new project for you to store your testing Octo Call data (no need of Analytics).
- Create credentials for Web and it'll output your Firebase config values.
- Create a ".env.development.local" with your data, but
  following ".env.development.sample" structure.

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

## License

This a project lead by [Mazuh](https://github.com/Mazuh)
and under [MIT License](./LICENSE).
