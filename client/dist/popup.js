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

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#list-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage(null, {type: 'list'});
    });
    document.querySelector('#create-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage(null, {type: 'create'});
    });
    document.querySelector('#conn-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage(null, {
            type: 'conn',
            id: parseInt(document.querySelector('#connect-input').value),
        });
    });
    document.querySelector('#disconn-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage(null, {type: 'disconn'});
    });
});
