# Browser Tab Session Manager

![NodeJS CI](https://github.com/GoogleChromeLabs/browser-tab-session-manager/actions/workflows/build.yml/badge.svg?event=push)

**This is not an officially supported Google product**

Browser Tab Session Manager (BTSM) aims to allow Chrome users to share their
open tabs between multiple devices.

The overall approach, which is loosely inspired by
[tmux](https://github.com/tmux/tmux/wiki), will be to have a concept of a
"session" (made of some set of tabs) that is managed on a user-hosted server,
which multiple clients (devices running Chrome) can share a connection to at the
same time.

## Goals

* **Primary**: Allow Chrome to have "sessions" of tabs that can be synchronized
  between multiple devices.
* **Secondary**: Allow users to open up sessions for collaboration (tabsets are
  shared between multiple users).
* **Tertiary**: Sync tab state, not just location. This is very much harder and
  may be infeasible.

## Planned Approach

* Like in tmux, there will be a central server to manage all the sessions..
* A Chrome window is a session. All the tabs in a window are opened, closed, and
  navigated between all connected clients in real time.
  * Perhaps a Tab Group could also be a session instead of a window?
* Any number of clients can connect to any given session at a time.
* Authentication is per-session - ie, you can share on a session-by-session
  basis for collaboration. Collaboration is likely handled via some kind of
  sharable auth token or magic URL.
* Connection between Chrome clients and server likely done with WebSockets and a
  Chrome extension. Server likely Node.
* Sessions should be periodically written to disk (on the server) in case of
  reboot or crash.
* Protocol Buffers likely used for client/server communication and sessions
  written to disk.
* [TODO]: How to handle disconnected/offline clients?

## Current state

Fairly bare-bones protocol outline for now. Basic RPC infrastructure is in
place and working, and some accounting for which sessions exist, which clients
and windows belong to which sessions, etc. Little to no error handling.

The client and server both know how to receive and log requests, and respond to
some of them, but implementation is incomplete in almost all cases.

Creating a session in one window, then connecting to it in another window
results in the 2nd window opening all the same tabs as the original window. No
attempt is made at merging the two states yet, and after the initial
connection, the two windows don't affect each other anymore.

Both client and server are still hardcoded to use localhost only, and there's
no authentication or encryption involved.

## Installing and building BTSM

The build scripts currently only work on Linux.

[Node](https://nodejs.org/) v16 or v17 (with [NPM](https://www.npmjs.com/) v7 or
v8, respectively) are used by BTSM for dependency management, and have to
be available on the host operating system. The recommended way to install these
is to first [install
NVM](https://github.com/nvm-sh/nvm#installing-and-updating), then use NVM to
install the latest NPM+Node by running:

```bash
nvm install node
```

Then check out this repository and initialize your environment by running:

```bash
pushd client; npm install; popd
npm install
```

To build the client and server, respectively:

```bash
npm run buildclient
npm run buildserver
```

## Installing the BTSM client Chrome extension

See [these
instructions](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
for how to load an unpacked extension in Chrome.

## Running the BTSM server

```bash
npm run serve
```

## Coding Style

The source of truth is `npm run lint`, which is configured by
[.eslintrc.json](.eslintrc.json). To automatically fix as many lint errors as
possible, rather than just printing them out, you can instead run `npm run fix`.

For convenience, this project contains a [.editorconfig](.editorconfig) file
capable of setting up some basics in many popular editors, though some may need
plugins. See https://editorconfig.org/ for more details and plugin installation
instructions.

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for more.

## License

See [LICENSE](./LICENSE) for more.
