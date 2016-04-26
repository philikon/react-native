/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule XMLHttpRequestEventTarget
 * @flow
 */
'use strict';

const EventTarget = require('event-target-shim');

const EVENTS = [
  'abort',
  'error',
  'load',
  'loadstart',
  'progress',
  'timeout',
  'loadend',
];

class XMLHttpRequestEventTarget extends EventTarget(EVENTS) {
  static Events: Array<string> = EVENTS;

  onload: ?Function;
  onloadstart: ?Function;
  onprogress: ?Function;
  ontimeout: ?Function;
  onerror: ?Function;
  onloadend: ?Function;
}

module.exports = XMLHttpRequestEventTarget;
