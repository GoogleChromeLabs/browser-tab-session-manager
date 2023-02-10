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

import { createLogger, format, transports } from 'winston';

import { setLogger, pretty } from './shared/logger.js';
import { Client } from './client';

setLogger(createLogger({
  level: 'debug',
  transports: [
    new transports.Console(),
  ],
  format: format.combine(
      pretty(2 /* depth */, true /* colourize */, true /* showHidden */, 100 /* breakLength */),
  ),
}));

const client = Client.instance();

chrome.webNavigation.onCompleted.addListener(client.onNavigation.bind(client));

chrome.tabs.onCreated.addListener(client.onTabCreated.bind(client));
chrome.tabs.onAttached.addListener(client.onTabAttached.bind(client));
chrome.tabs.onDetached.addListener(client.onTabDetached.bind(client));
chrome.tabs.onRemoved.addListener(client.onTabRemoved.bind(client));
chrome.tabs.onMoved.addListener(client.onTabMoved.bind(client));
chrome.tabs.onReplaced.addListener(client.onTabReplaced.bind(client));

chrome.runtime.onMessage.addListener(client.onMessage.bind(client));
