/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BlobReader
 * @flow
 */
'use strict';

const XMLHttpRequestEventTarget = require('XMLHttpRequestEventTarget');

const EMPTY = 0;
const LOADING = 1;
const DONE = 2;

class BlobReader extends XMLHttpRequestEventTarget {

  static EMPTY: number = EMPTY;
  static LOADING: number = LOADING;
  static DONE: number = DONE;

  EMPTY: number = EMPTY;
  LOADING: number = LOADING;
  DONE: number = DONE;

  error: ?Error = null;
  readyState: number = EMPTY;
  result: ?string | ?ArrayBuffer = null;

  abort() {
    // TODO
  }

  readAsArrayBuffer() {
    // TODO
  }

  readAsDataURL() {
    // TODO
  }

  readAsText() {
    // TODO
  }

}

module.exports = BlobReader;
