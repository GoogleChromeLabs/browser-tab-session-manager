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
import * as spb from '../../proto/session.cjs';

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
   * Called when a new tab is opened.
   *
   * @param {chrome.tabs.Tab} tab The newly-created tab.
   */
  async onTabCreated(tab: chrome.tabs.Tab) {
    const windowId = (await chrome.windows.getCurrent()).id;

    console.log(`tab created (tab ${tab.id}, window ${windowId})`);
  }

  /**
   * Called when a tab is 'attached' to a new window (from a drag-and-drop action).
   *
   * @param {number} tabId The unique ID for the attached tab.
   * @param {chrome.tabs.TabAttachInfo} attachInfo Extra event info from Chrome.
   */
  async onTabAttached(tabId: number, attachInfo: chrome.tabs.TabAttachInfo) {
    const windowId = (await chrome.windows.getCurrent()).id;

    console.log(`tab attached at position ${attachInfo.newPosition} (tab ${tabId}, window ` +
      `${windowId} =? ${attachInfo.newWindowId})`);

    // In this case we may need to send both 'created' and 'navigated' events to the server? Or
    // else add a new RPC.

    // It's also possible that this tab was the only tab in the other window, in which case that
    // window effectively gets closed - so we may need to handle deleting that session?
  }

  /**
   * Called when a tab is 'detached' from a new window (from a drag-and-drop action).
   *
   * @param {number} tabId The unique ID for the detached tab.
   * @param {chrome.tabs.TabDetachInfo} detachInfo Extra event info from Chrome.
   */
  async onTabDetached(tabId: number, detachInfo: chrome.tabs.TabDetachInfo) {
    const windowId = (await chrome.windows.getCurrent()).id;

    console.log(`tab detached (tab ${tabId}, window ${windowId})`);

    // Detaching from a window will mean being removed from the session.
    this.onTabRemoved(tabId, {
      windowId: detachInfo.oldWindowId,
      isWindowClosing: false,
    });
  }

  /**
   * Called when a tab is closed.
   *
   * @param {number} tabId The unique ID that belonged to the now-closed tab.
   * @param {chrome.tabs.TabRemoveInfo} removeInfo Extra event info from Chrome.
   */
  async onTabRemoved(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
    const windowId = removeInfo.windowId;

    // If removeInfo.isWindowClosing is true, then we would want to delete the session.

    console.log(`tab removed (tab ${tabId}, window ${windowId}) - isWindowClosing: ` +
      `${removeInfo.isWindowClosing}`);
  }

  /**
   * Called when a tab is moved within the same window.
   *
   * @param {number} tabId The unique ID for the moved tab.
   * @param {chrome.tabs.TabMoveInfo} moveInfo Extra event info from Chrome.
   */
  async onTabMoved(tabId: number, moveInfo: chrome.tabs.TabMoveInfo) {
    const windowId = (await chrome.windows.getCurrent()).id;

    console.log(`tab moved (tab ${tabId}, window ${windowId} =? ${moveInfo.windowId}) - from ` +
      `index ${moveInfo.fromIndex}, to index ${moveInfo.toIndex}`);
  }

  /**
   * Called when a tab is 'replaced'. I don't really know when this happens, I'll have to check
   * the docs.
   *
   * @param {number} addedTabId The unique ID for the new tab.
   * @param {number} removedTabId The unique ID for the old tab.
   */
  async onTabReplaced(addedTabId: number, removedTabId: number) {
    const windowId = (await chrome.windows.getCurrent()).id;

    console.log(`tab replaced (old tab ${removedTabId}, new tab ${addedTabId}, ` +
      `window ${windowId})`);
  }

  /**
   * Called when a message is received from the extension's popup window. Currently used as an
   * easy way to trigger events during development.
   *
   * @param {any} msg The message sent from the popup window.
   */
  async onMessage(msg: any) {
    switch (msg.type) {
      case 'list':
        this.server!.sendRequest(rpcpb.Request.create({
          listSessionsRequest: {},
        }), null);
        break;

      case 'create':
        this.server!.sendRequest(rpcpb.Request.create({
          createSessionRequest: {
            sessionType: spb.Session.SessionType.SESSION_TYPE_WINDOW,
          },
        }), null);
        break;

      case 'conn':
        this.server!.sendRequest(rpcpb.Request.create({
          connectToSessionRequest: {
            id: msg.id,
          },
        }), null);
        break;

      case 'disconn':
        this.server!.sendRequest(rpcpb.Request.create({
          disconnectFromSessionRequest: {
            id: 1234, // TODO: use a real session id
          },
        }), null);
        break;
    }
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
