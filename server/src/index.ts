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
import * as rpcpb from '../../proto/rpc.cjs';

const wss = new WebSocketServer({ host: 'localhost', port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    console.log(`received message: '${data}'`);
    const msg = rpcpb.RPC.fromObject(JSON.parse(data.toString()));
    console.log('request=');
    console.log(msg.request);

    const reply = rpcpb.RPC.create({
      response: {
        navigationResponse: {},
      },
    });
    ws.send(JSON.stringify(reply.toJSON()));
  });
});
