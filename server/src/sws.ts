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

import { AbstractWebSocket } from './shared/rpc.js';

/**
 * Wrapper around an npm 'ws' WebSocket.
 */
export class ServerWebSocket implements AbstractWebSocket {
  private ws: any; // TODO: add types

  /**
   * Constructs a ServerWebSocket.
   *
   * @param {any} ws A WebSocket.
   */
  constructor(ws: any) {
    this.ws = ws;
  }

  /**
   * Sets the onopen event handler.
   *
   * @param {function(): any} handler Callback function to run when the WebSocket open event fires.
   */
  onOpen(handler: () => any): any {
    this.ws.on('open', handler); // TODO - anything else needed here?
  }

  /**
   * Sets the onmessage event handler.
   *
   * @param {function(data: any): any} handler Callback function to run when the WebSocket message
   *     event fires.
   */
  onMessage(handler: (data: any /* TODO: type? */) => any): any {
    this.ws.on('message', handler);
  }

  /**
   * Sets the onerror event handler.
   *
   * @param {function(e: Event): any} handler Callback function to run when the WebSocket error
   *     event fires.
   */
  onError(handler: (e: any /* TODO: type? */) => any): any {
    this.ws.on('error', handler); // TODO - anything else needed here?
  }

  /**
   * Sets the onclose event handler.
   *
   * @param {function(e: CloseEvent): any} handler Callback function to run when the WebSocket
   *     close event fires.
   */
  onClose(handler: (e: any /* TODO: type? */) => any): any {
    this.ws.on('close', handler); // TODO - anything else needed here?
  }

  /**
   * Sends data over the WebSocket connection.
   *
   * @param {string | ArrayBuffer} data The data to send over the WebSocket connection.
   */
  send(data: string | ArrayBuffer): void {
    this.ws.send(data);
  }
}
