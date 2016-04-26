/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "RCTBlobManager.h"
#import "RCTConvert.h"

@implementation RCTBlobManager
{
  NSMutableDictionary<NSString *, NSData *> *_blobs;
  NSOperationQueue *_queue;
}

RCT_EXPORT_MODULE()

- (NSString *)store:(NSData *)data
{
  NSString *blobId = [NSUUID UUID].UUIDString;
  _blobs[blobId] = data;
  return blobId;
}

- (void)store:(NSData *)data withId:(NSString *)blobId
{
  _blobs[blobId] = data;
}

- (NSData *)resolve:(NSString *)blobId offset:(NSInteger)offset size:(NSInteger)size
{
  NSData *data = _blobs[blobId];
  if (!data) {
    return nil;
  }
  if (offset != 0 || (size != -1 && size != data.length)) {
    data = [data subdataWithRange:NSMakeRange(offset, size)];
  }
  return data;
}

RCT_EXPORT_METHOD(createFromParts:(NSString *)blobId parts:(NSArray<NSDictionary<NSString *, id> *> *)parts)
{
  NSMutableData *data = [NSMutableData new];
  for (NSDictionary<NSString *, id> *part in parts) {
    NSString *partId = [RCTConvert NSString:part[@"blobId"]];
    NSNumber *offset = [RCTConvert NSNumber:part[@"offset"]];
    NSNumber *size = [RCTConvert NSNumber:part[@"size"]];
    NSData *partData = [self resolve:partId
                              offset:offset ? [offset integerValue] : 0
                                size:size ? [size integerValue] : -1];
    [data appendData:partData];
  }
  [self store:data withId:blobId];
}

RCT_EXPORT_METHOD(release:(NSString *)blobId)
{
  [_blobs removeObjectForKey:blobId];
}

#pragma mark - RCTURLRequestHandler methods

- (BOOL)canHandleRequest:(NSURLRequest *)request
{
  return [request.URL.scheme caseInsensitiveCompare:@"blob"] == NSOrderedSame;
}

- (id)sendRequest:(NSURLRequest *)request
     withDelegate:(id<RCTURLRequestDelegate>)delegate;
{
  // Lazy setup
  if (!_queue) {
    _queue = [NSOperationQueue new];
    _queue.maxConcurrentOperationCount = 2;
  }

  __weak __block NSBlockOperation *weakOp;
  __block NSBlockOperation *op = [NSBlockOperation blockOperationWithBlock:^{
    NSURLResponse *response = [[NSURLResponse alloc] initWithURL:request.URL
                                                        MIMEType:nil
                                           expectedContentLength:-1
                                                textEncodingName:nil];

    [delegate URLRequest:weakOp didReceiveResponse:response];

    NSURLComponents *components = [[NSURLComponents alloc] initWithURL:request.URL resolvingAgainstBaseURL:NO];

    NSString *blobId = components.host;
    NSInteger offset = 0;
    NSInteger size = -1;

    if (components.queryItems) {
      for (NSURLQueryItem *queryItem in components.queryItems) {
        /*
        if ([queryItem.name isEqualToString:@"blobId"]) {
          blobId = queryItem.value;
        }
        */
        if ([queryItem.name isEqualToString:@"offset"]) {
          offset = [queryItem.value integerValue];
        }
        if ([queryItem.name isEqualToString:@"size"]) {
          size = [queryItem.value integerValue];
        }
      }
    }

    NSData *data;
    if (blobId) {
      data = [self resolve:blobId offset:offset size:size];
    }
    NSError *error;
    if (data) {
      [delegate URLRequest:weakOp didReceiveData:data];
    } else {
      error = [[NSError alloc] initWithDomain:NSURLErrorDomain code:NSURLErrorBadURL userInfo:nil];
    }
    [delegate URLRequest:weakOp didCompleteWithError:error];
  }];

  weakOp = op;
  [_queue addOperation:op];
  return op;
}

- (void)cancelRequest:(NSOperation *)op
{
  [op cancel];
}

@end


@implementation RCTBridge (RCTBlobManager)

- (RCTBlobManager *)blobs
{
  return [self moduleForClass:[RCTBlobManager class]];
}

@end
