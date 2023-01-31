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

import { Rpc } from './shared/rpc.js';
import { Handler } from './rpc_handler.js';
import { ServerWebSocket } from './sws.js';

/**
 * Singleton representing the whole server instance. Manages clients, RPC connections, and session
 * state.
 */
export class Server {
  private static singleton?: Server;

  private wss: WebSocketServer = new WebSocketServer({ host: 'localhost', port: 8080 });
  private client?: Rpc;

  /**
   * Creates a Server.
   */
  private constructor() {
    console.log('constructed');
    this.wss.on('connection', (ws) => {
      this.client = new Rpc(new Handler(), new ServerWebSocket(ws));
      console.log('connected');
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
}
