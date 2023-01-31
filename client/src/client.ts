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

import * as rpcpb from '../../proto/rpc.cjs';

import { Rpc } from './shared/rpc.js';
import { Handler } from './rpc_handler.js';
import { ClientWebSocket } from './cws.js';

/**
 * Singleton class to deal with basically the entire job of being a client (owns RPC connections,
 * etc).
 */
export class Client {
  private static singleton?: Client;

  private server?: Rpc;

  /**
   * Creates a Client.
   */
  private constructor() {
    const ws = new WebSocket('ws://localhost:8080'); // TODO: wait for open event...

    this.server = new Rpc(new Handler(), new ClientWebSocket(ws));
  }

  /**
   * Return the one instance of this class.
   *
   * @return {Client} this.
   */
  static instance(): Client {
    if (!this.singleton) {
      this.singleton = new Client();
    }
    return this.singleton;
  }

  /**
   * Gets called whenever Chrome performs a navigation.
   *
   * @param {chrome.webNavigation.WebNavigationFramedCallbackDetails} details Navigation
   *     information from Chrome.
   */
  async onNavigation(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
    const windowId = (await chrome.windows.getCurrent()).id;

    console.log(`completed nav (window ${windowId})`);
    const req = rpcpb.Request.create({
      navigationRequest: {
        url: details.url,
      },
    });
    this.server!.sendRequest(req, (resp: rpcpb.IResponse, subResp: rpcpb.INavigationResponse) => {
      console.log(`in navigationRequest callback ${resp.responseId} with resp ${subResp}`);
    });
  }
}
