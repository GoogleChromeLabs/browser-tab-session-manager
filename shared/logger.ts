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

import { format, Logform, Logger } from 'winston';
import { inspect } from 'util';
import { MESSAGE, SPLAT } from 'triple-beam';

const prettyish = format((info, opts) => {
  const whole = info[SPLAT] ? [info.message].concat(info[SPLAT]) : [info.message];
  const rest = whole.map((x) => {
    if (typeof x === 'string') {
      return x;
    }
    return inspect(x, opts);
  });

  info[MESSAGE] = info.timestamp + '  ' + info.level + '  ' + rest.join('');
  return info;
});

/**
 * Create a nice readable Format for Winston.
 *
 * @param {number} depth How many levels deep in an object's structure to traverse and print.
 * @param {boolean} colourize Output with pretty colours.
 * @param {boolean} showHidden Show hidden symbols in objects.
 * @param {number} breakLength How many characters to print before a line break.
 * @return {Logform.Format} Format for use with Winston.
 */
export function pretty(depth: number, colourize: boolean, showHidden: boolean,
    breakLength: number): Logform.Format {
  let formats: Logform.Format[] = [];
  if (colourize) {
    formats.push(format.colorize());
  }
  formats = formats.concat([format.padLevels(), format.timestamp(), prettyish({
    depth: depth,
    colors: colourize,
    showHidden: showHidden,
    breakLength: breakLength,
  })]);
  return format.combine(...formats);
}

export let log: Logger;

/**
 * Set global logger instance.
 *
 * @param {Logger} logger The logger instance.
 */
export function setLogger(logger: Logger): void {
  log = logger;
}
