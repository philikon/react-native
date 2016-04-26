/**
 * Copyright (c) 2015-2016 Silk Labs, Inc.
 * All Rights Reserved.
 *
 * @providesModule BlobURL
 * @flow
 */
'use strict';

const Platform = require('Platform');

let BLOB_URL_PREFIX = '';
if (Platform.OS === 'ios') {
  BLOB_URL_PREFIX = 'blob:';
} else if (Platform.OS === 'android') {
  BLOB_URL_PREFIX = 'content://com.facebook.react.blobs/';
}

class URL {

  constructor() {
    throw new Error('Creating URL objects is not supported.');
  }

  static createObjectURL(blob: Blob) {
    return `${BLOB_URL_PREFIX}${blob.blobId}?offset=${blob._offset}&size=${blob.size}`;
  }

  static revokeObjectURL(url: string) {
    // Do nothing.
  }

}

module.exports = URL;
