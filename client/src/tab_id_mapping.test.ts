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

import { TabIdMappings } from './tab_id_mapping';

import { test, expect, beforeEach } from '@jest/globals';

let tim: TabIdMappings;

beforeEach(() => {
  tim = new TabIdMappings();
  tim.add(1, 2);
  tim.add(5, 10);
  tim.add(25, 10);
});

test('local-to-remote mappings exist', () => {
  expect(tim.getRemote(1)).toBe(2);
  expect(tim.getRemote(5)).toBe(10);
});

test('non-existent local-to-remote mappings don\'t exist', () => {
  expect(tim.getRemote(3)).toBe(undefined);
  expect(tim.getRemote(4)).toBe(undefined);
  expect(tim.getRemote(2)).toBe(undefined);
  expect(tim.getRemote(10)).toBe(undefined);
});

test('remote-to-locals mappings exist', () => {
  expect(tim.getLocals(2)).toEqual(new Set([1]));
  expect(tim.getLocals(10)).toEqual(new Set([5, 25]));
});

test('non-existent remote-to-locals mappings don\'t exist', () => {
  expect(tim.getLocals(3)).toBe(undefined);
  expect(tim.getLocals(4)).toBe(undefined);
  expect(tim.getLocals(1)).toBe(undefined);
  expect(tim.getLocals(5)).toBe(undefined);
  expect(tim.getLocals(25)).toBe(undefined);
});

test('removing mappings works', () => {
  expect(tim.getRemote(1)).toBe(2);
  expect(tim.getLocals(2)).toEqual(new Set([1]));
  tim.remove(1, 2);
  expect(tim.getRemote(1)).toBe(undefined);
  expect(tim.getLocals(2)).toBe(undefined);

  expect(tim.getLocals(10)).toEqual(new Set([5, 25]));
  tim.remove(5, 10);
  expect(tim.getLocals(10)).toEqual(new Set([25]));
});
