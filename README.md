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

For tests, you can run:

```
npm test
```

Or its variant for a live testing experience:

```sh
npm run test:watch
```

Happy coding!

## Licensing

This a project lead by [Mazuh](https://github.com/Mazuh)
and under [MIT License](./LICENSE).
