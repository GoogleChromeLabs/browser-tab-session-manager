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

/**
 * Maintains a bidirectional mapping between Chrome Tab IDs and server-side Tab IDs.
 */
export class TabIdMappings {
  private localToRemote = new Map<number, number>();
  private remoteToLocals = new Map<number, Set<number>>();

  /**
   * Stores a mapping.
   *
   * @param {number} local The local Tab ID.
   * @param {number} remote The remote Tab ID.
   */
  add(local: number, remote: number) {
    this.localToRemote.set(local, remote);
    if (this.remoteToLocals.has(remote)) {
      this.remoteToLocals.get(remote)!.add(local);
    } else {
      this.remoteToLocals.set(remote, new Set<number>([local]));
    }
  }

  /**
   * Retrieves a remote ID, given a local one.
   *
   * @param {number} local The local Tab ID.
   * @return {number | undefined} The remote Tab ID, or undefined if the mapping doesn't exist.
   */
  getRemote(local: number): number | undefined {
    return this.localToRemote.get(local);
  }

  /**
   * Retrieves a set of local IDs, given a remote one.
   *
   * @param {number} remote
   * @return {Set<number> | undefined} The local Tab IDs, or undefined if the mapping doesn't
   *     exist.
   */
  getLocals(remote: number): Set<number> | undefined {
    return this.remoteToLocals.get(remote);
  }

  /**
   * Deletes a mapping.
   *
   * @param {number} local The local Tab ID.
   * @param {number} remote The remote Tab ID.
   */
  remove(local: number, remote: number) {
    this.localToRemote.delete(local);
    this.remoteToLocals.get(remote)!.delete(local);
    if (this.remoteToLocals.get(remote)!.size === 0) {
      this.remoteToLocals.delete(remote);
    }
  }
}
