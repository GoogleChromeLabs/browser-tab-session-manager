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

import * as rpcpb from '../../../proto/rpc.cjs';

/**
 * An object that handles incoming RPC requests.
 */
export interface RpcHandler {
  handleListSessionsRequest(req: rpcpb.IRequest, subReq: rpcpb.IListSessionsRequest): void;
  handleConnectToSessionRequest(req: rpcpb.IRequest, subReq: rpcpb.IConnectToSessionRequest): void;
  handleDisconnectFromSessionRequest(req: rpcpb.IRequest,
    subReq: rpcpb.IDisconnectFromSessionRequest): void;
  handleSendStateRequest(req: rpcpb.IRequest, subReq: rpcpb.ISendStateRequest): void;
  handleOpenTabRequest(req: rpcpb.IRequest, subReq: rpcpb.IOpenTabRequest): void;
  handleCloseTabRequest(req: rpcpb.IRequest, subReq: rpcpb.ICloseTabRequest): void;
  handleCreateSessionRequest(req: rpcpb.IRequest, subReq: rpcpb.ICreateSessionRequest): void;
  handleNavigationRequest(req: rpcpb.IRequest, subReq: rpcpb.INavigationRequest): void;
}

/**
 * Wrapper around WebSocket implementations. Unfortunately the client and server WebSockets aren't
 * compatible.
 */
export interface AbstractWebSocket {
  onOpen(handler: () => any): any;
  onMessage(handler: (data: any) => any): any;
  onError(handler: (e: any) => any): any;
  onClose(handler: (e: any) => any): any;
  send(data: string | ArrayBuffer): void;
}

/**
 * Function to call when we receive a response.
 */
type ResponseCallback = (resp: rpcpb.IResponse, subResp: any) => void;

/**
 * Object to keep track of responses we are expecting to get back from our requests.
 */
type AwaitedResponse = {
  messageId: number,
  request: rpcpb.IRequest,
  callback: ResponseCallback,
  // TODO: deadline
}

/**
 * Rpc handles sending and receiving messages between the client and server, including matching up
 * message types with their corresponding handler and callback functions.
 */
export class Rpc {
  // Note: |awaitedResponses| is a sparse array.
  private awaitedResponses: AwaitedResponse[] = [];
  private messageId: number = 0;
  private requestId: number = 0;

  private handler: RpcHandler;
  private ws: AbstractWebSocket;

  /**
   * Constructs an Rpc object.
   *
   * @param {RpcHandler} handler The client or server handler for incoming requests.
   * @param {AbstractWebSocket} ws A WebSocket.
   */
  constructor(handler: RpcHandler, ws: AbstractWebSocket) {
    this.handler = handler;
    this.ws = ws;

    ws.onMessage((data: any): any => {
      const msg: rpcpb.RPC = rpcpb.RPC.fromObject(JSON.parse(data.toString()));

      if (msg.request) {
        this.handleRequest(msg.request);
      } else if (msg.response) {
        this.handleResponse(msg.response);
      } else {
        console.log('msg.* undefined');
      }
    });

    ws.onError((e: any) => {
      console.log(`ws error: ${e}`);
    });

    ws.onClose((e: any) => {
      console.log(`ws closed: ${e}`);
    });
  }

  /**
   * Sets the WebSocket's onopen event handler.
   *
   * @param {function(): any} handler Callback function to run when the WebSocket open event fires.
   */
  onOpen(handler: () => any) {
    this.ws.onOpen(handler);
  }

  /**
   * Delegates a request to the proper method on the handler.
   *
   * @param {rpcpb.IRequest} req The request.
   */
  private handleRequest(req: rpcpb.IRequest) {
    if (req.listSessionsRequest) {
      this.handler.handleListSessionsRequest(req, req.listSessionsRequest);
    } else if (req.connectToSessionRequest) {
      this.handler.handleConnectToSessionRequest(req, req.connectToSessionRequest);
    } else if (req.disconnectFromSessionRequest) {
      this.handler.handleDisconnectFromSessionRequest(req, req.disconnectFromSessionRequest);
    } else if (req.sendStateRequest) {
      this.handler.handleSendStateRequest(req, req.sendStateRequest);
    } else if (req.openTabRequest) {
      this.handler.handleOpenTabRequest(req, req.openTabRequest);
    } else if (req.closeTabRequest) {
      this.handler.handleCloseTabRequest(req, req.closeTabRequest);
    } else if (req.createSessionRequest) {
      this.handler.handleCreateSessionRequest(req, req.createSessionRequest);
    } else if (req.navigationRequest) {
      this.handler.handleNavigationRequest(req, req.navigationRequest);
    } else {
      console.log('msg.request.* undefined');
    }
  }

  /**
   * Finds and calls the callback for the given response (if one exists).
   *
   * @param {rpcpb.IResponse} resp The incoming response RPC.
   */
  private handleResponse(resp: rpcpb.IResponse): void {
    const ar = this.awaitedResponses[resp.responseId as number];
    if (!ar) {
      return;
    }
    delete this.awaitedResponses[resp.responseId as number];

    if (resp.listSessionsResponse) {
      ar.callback(resp, resp.listSessionsResponse);
    } else if (resp.connectToSessionResponse) {
      ar.callback(resp, resp.connectToSessionResponse);
    } else if (resp.disconnectFromSessionResponse) {
      ar.callback(resp, resp.disconnectFromSessionResponse);
    } else if (resp.sendStateResponse) {
      ar.callback(resp, resp.sendStateResponse);
    } else if (resp.openTabResponse) {
      ar.callback(resp, resp.openTabResponse);
    } else if (resp.closeTabResponse) {
      ar.callback(resp, resp.closeTabResponse);
    } else if (resp.createSessionResponse) {
      ar.callback(resp, resp.createSessionResponse);
    } else if (resp.navigationResponse) {
      console.log(`navigation response: ${resp.navigationResponse}`);
      ar.callback(resp, resp.navigationResponse);
    } else {
      console.log('msg.response.* undefined');
    }
  }

  /**
   * Sends a request over the WebSocket connection and sets up the awaited response callback (if
   * applicable).
   *
   * @param {rpcpb.IRequest} req The request to send.
   * @param {ResponseCallback | null} callback The (optional) callback to call when we get a
   *     response to the request.
   */
  sendRequest(req: rpcpb.IRequest, callback: ResponseCallback | null) {
    this.messageId++;
    this.requestId++;
    req.requestId = this.requestId;
    const msg = rpcpb.RPC.create({
      messageId: this.messageId,
      request: req,
    });
    this.ws.send(JSON.stringify(msg.toJSON())); // TODO: ensure this.ws is connected?

    if (callback) {
      this.awaitedResponses[req.requestId] = {
        messageId: msg.messageId,
        request: req,
        callback: callback,
      };
    }
  }

  /**
   * Sends a response RPC through the WebSocket connection.
   *
   * @param {rpcpb.IResponse} resp The response to send.
   */
  sendResponse(resp: rpcpb.IResponse) {
    this.messageId++;
    const msg = rpcpb.RPC.create({
      messageId: this.messageId,
      response: resp,
    });
    this.ws.send(JSON.stringify(msg.toJSON()));
  }
}
