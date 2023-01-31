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

import { Responder, RpcHandler } from './shared/rpc.js';

/**
 * RpcHandler used by the Server.
 */
export class Handler implements RpcHandler {
  private responder?: Responder;

  /**
   * Sets a Responder we can use to respond to requests.
   *
   * @param {Responder} responder The Responder.
   */
  setResponder(responder: Responder) {
    this.responder = responder;
  }

  /**
   * Handles a ListSessionsRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.IListSessionsRequest} subReq The IListSessionsRequest.
   */
  handleListSessionsRequest(req: rpcpb.IRequest, subReq: rpcpb.IListSessionsRequest) {
    console.log(`received handleListSessionsRequest message: '${subReq}'`);
  }

  /**
   * Handles a ConnectToSessionRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.IConnectToSessionRequest} subReq The IConnectToSessionRequest.
   */
  handleConnectToSessionRequest(req: rpcpb.IRequest, subReq: rpcpb.IConnectToSessionRequest) {
    console.log(`received handleConnectToSessionRequest message: '${subReq}'`);
  }

  /**
   * Handles a DisconnectFromSessionRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.IDisconnectFromSessionRequest} subReq The IDisconnectFromSessionRequest.
   */
  handleDisconnectFromSessionRequest(req: rpcpb.IRequest,
      subReq: rpcpb.IDisconnectFromSessionRequest) {
    console.log(`received handleDisconnectFromSessionRequest message: '${subReq}'`);
  }

  /**
   * Handles a SendStateRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.ISendStateRequest} subReq The ISendStateRequest.
   */
  handleSendStateRequest(req: rpcpb.IRequest, subReq: rpcpb.ISendStateRequest) {
    console.log(`received handleSendStateRequest message: '${subReq}'`);
  }

  /**
   * Handles a OpenTabRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.IOpenTabRequest} subReq The IOpenTabRequest.
   */
  handleOpenTabRequest(req: rpcpb.IRequest, subReq: rpcpb.IOpenTabRequest) {
    console.log(`received handleOpenTabRequest message: '${subReq}'`);
  }

  /**
   * Handles a CloseTabRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.ICloseTabRequest} subReq The ICloseTabRequest.
   */
  handleCloseTabRequest(req: rpcpb.IRequest, subReq: rpcpb.ICloseTabRequest) {
    console.log(`received handleCloseTabRequest message: '${subReq}'`);
  }

  /**
   * Handles a CreateSessionRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.ICreateSessionRequest} subReq The ICreateSessionRequest.
   */
  handleCreateSessionRequest(req: rpcpb.IRequest, subReq: rpcpb.ICreateSessionRequest) {
    console.log(`received handleCreateSessionRequest message: '${subReq}'`);
  }

  /**
   * Handles a NavigationRequest.
   *
   * @param {rpcpb.IRequest} req The full request.
   * @param {rpcpb.INavigationRequest} subReq The INavigationRequest.
   */
  handleNavigationRequest(req: rpcpb.IRequest, subReq: rpcpb.INavigationRequest) {
    console.log(`received handleNavigationRequest message: '${subReq.url}'`);
    const resp = rpcpb.Response.create({
      responseId: req.requestId,
      navigationResponse: {},
    });
    this.responder!.sendResponse(resp);
  }
}
