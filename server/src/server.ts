/*
 * Copyright 2023 Google Inc. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { WebSocketServer } from 'ws';

import * as spb from '../../proto/session.cjs';

import { log } from './shared/logger.js';
import { Rpc } from './shared/rpc.js';
import { Handler } from './rpc_handler.js';
import { ServerWebSocket } from './sws.js';

/**
 * A session proto object plus a list of connected clients.
 */
type Session = {
  impl: spb.ISession;
  clients: Rpc[];
};

/**
 * Singleton representing the whole server instance. Manages clients, RPC connections, and session
 * state.
 */
export class Server {
  private static singleton?: Server;

  private wss: WebSocketServer = new WebSocketServer({ host: 'localhost', port: 8080 });
  private clients: Rpc[] = [];
  private sessions: Session[] = [];
  private sessionId: number = 0;
  private clientId: number = 0;
  private tabId: number = 0;

  /**
   * Creates a Server.
   */
  private constructor() {
    log.debug('constructed');
    this.wss.on('connection', (ws) => {
      this.clientId++;
      const client = new Rpc(new Handler(this.clientId, this), new ServerWebSocket(ws));
      log.debug('connected');
      this.clients[this.clientId] = client;
    });
  }

  /**
   * The one instance of this class.
   *
   * @return {Server} this.
   */
  static instance(): Server {
    if (!this.singleton) {
      this.singleton = new Server();
    }
    return this.singleton;
  }

  /**
   * Creates a new session connected to the client with ID |clientId|
   *
   * @param {number} clientId The ID of the client to initially associate with the new session.
   * @param {spb.Session.SessionType} sessionType The type of the new session (window or tab group).
   * @return {spb.ISession} The newly created session.
   */
  createSession(clientId: number, sessionType: spb.Session.SessionType): spb.ISession {
    this.sessionId++;
    const session = spb.Session.create({
      sessionType: sessionType,
      id: this.sessionId,
    });
    this.sessions[this.sessionId] = {
      impl: session,
      clients: [this.clients[clientId]],
    };
    return session;
  }

  /**
   * Gets a list of all active sessions.
   *
   * @return {spb.ISession[]} List of sessions.
   */
  listSessions(): spb.ISession[] {
    const sessions: spb.ISession[] = [];
    for (const i in this.sessions) {
      if (this.sessions.hasOwnProperty(i)) {
        sessions.push(this.sessions[i].impl);
      }
    }
    return sessions;
  }

  /**
   * Merge the current server-side session with a session state provided by a client. Used when a
   * new client connects to a session (or when a new session is created).
   *
   * @param {spb.ISession} session The session from the client which needs to be merged into the
   *     server session.
   */
  mergeSession(session: spb.ISession): void {
    // TODO: perform some sort of intelligent merge, instead of just setting the session directly.
    // We'll also need to push the changes to all connected clients.
    this.sessions[session.id!].impl = session;
  }

  /**
   * Connects the client with ID |clientId| to the session with ID |sessionId|.
   *
   * @param {number} clientId The ID of the client to connect.
   * @param {number} sessionId The ID of the session to connect to.
   * @return {spb.ISession} The session with ID |sessionId|.
   */
  connectToSession(clientId: number, sessionId: number): spb.ISession {
    this.sessions[sessionId].clients[clientId] = this.clients[clientId];
    return this.sessions[sessionId].impl;
  }

  /**
   * Disconnects the client with ID |clientId| from the session with ID |sessionId|.
   *
   * @param {number} clientId The ID of the client to disconnect.
   * @param {number} sessionId The ID of the session to disconnect from.
   */
  disconnectFromSession(clientId: number, sessionId: number): void {
    delete this.sessions[sessionId].clients[clientId];
  }

  /**
   * Opens a new tab in the session with ID |sessionId|.
   *
   * @param {number} sessionId The ID of the session in which to open a new tab.
   * @return {spb.ITab} The newly-opened tab.
   */
  openTab(sessionId: number): spb.ITab {
    // TODO: broadcast update to all connected clients.
    this.tabId++;
    const tab = spb.Tab.create({
      id: this.tabId,
      sessionId: sessionId,
    });
    this.sessions[sessionId].impl.tabs?.push(tab);
    return tab;
  }

  /**
   * Closes a tab in the session with ID |sessionId|.
   *
   * @param {number} sessionId The ID of the session in which to close a tab.
   * @param {number} tabId The ID of the tab to close.
   */
  closeTab(sessionId: number, tabId: number): void {
    // TODO: broadcast update to all connected clients.
    delete this.sessions[sessionId].impl.tabs![tabId];
  }
}
