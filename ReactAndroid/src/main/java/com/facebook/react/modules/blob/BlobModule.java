/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.facebook.react.modules.blob;

import android.content.ContentProviderClient;
import android.content.ContentResolver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

public class BlobModule extends ReactContextBaseJavaModule {

  private ReactContext mReactContext;
  private BlobProvider mBlobProvider;

  public BlobModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
    initializeBlobProvider();
  }

  private void initializeBlobProvider() {
    ContentResolver resolver = mReactContext.getContentResolver();
    ContentProviderClient client = resolver.acquireContentProviderClient(BlobProvider.AUTHORITY);
    if (client == null) {
      return;
    }
    mBlobProvider = (BlobProvider)client.getLocalContentProvider();
    client.release();
  }

  @Override
  public String getName() {
    return "RCTBlob";
  }

  @ReactMethod
  public void createFromParts(String blobId, ReadableArray parts) {

  }

  @ReactMethod
  public void release(String blobId) {

  }

}
