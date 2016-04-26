/**
 * Copyright (c) 2015-2016 Silk Labs, Inc.
 * All Rights Reserved.
 *
 * Opaque JS representation of some binary data in native.
 *
 * The API is modeled after the W3C Blob API, with one caveat
 * regarding explicit deallocation. Please refer to the `close()`
 * method for further details.
 *
 * Example usage in a React component:
 *
 *   class WebSocketImage extends React.Component {
 *      state = {blob: null};
 *      componentDidMount() {
 *        let ws = this.ws = new WebSocket(...);
 *        ws.binaryType = 'blob';
 *        ws.onmessage = (event) => {
 *          if (this.state.blob) {
 *            this.state.blob.close();
 *          }
 *          this.setState({blob: event.data});
 *        };
 *      }
 *      componentUnmount() {
 *        if (this.state.blob) {
 *          this.state.blob.close();
 *        }
 *        this.ws.close();
 *      }
 *      render() {
 *        if (!this.state.blob) {
 *          return <View />;
 *        }
 *        return <Image source={{uri: URL.createObjectURL(this.state.blob)}} />;
 *      }
 *   }
 *
 * @providesModule Blob
 * @flow
 */
'use strict';

const BlobManager = require('NativeModules').BlobManager;

type BlobProps = {
  blobId: string;
  offset: number;
  size: number;
};

const UUID4 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
function createUUID(): string {
  return UUID4.replace(/[xy]/g, (pat) => {
    let nibble = Math.random() * 16 | 0;
    if (pat === 'y') {
      nibble &= 0x3;
      nibble |= 0x8;
    }
    return nibble.toString(16);
  });
}

class Blob {
  _blobId: string;
  _offset: number;

  size: number;
  type: string;

  constructor(parts: Array<Blob>, options: any) {
    let blobId = createUUID();
    let size = 0;
    BlobManager.createFromParts(blobId, parts.map((part) => {
      if (!(part instanceof Blob) {
        throw new Error("Can currently only create a Blob from other Blobs");
      }
      size += part.size;
      return {
        blobId: part._blobId,
        offset: part._offset,
        size: part.size,
      };
    });
    return Blob.create({
      blobId,
      offset: 0,
      size,
    });
  }

  static create(props: BlobProps): Blob {
    return Object.create(Blob, {
      _blobId: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: props.blobId,
      },
      _offset: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: props.offset,
      },
      size: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: props.size,
      },
      type: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: '',
      },
    });
  }

  slice(start?: number, end?: number): Blob {
    let offset = this._offset;
    let size = this.size;
    if (start !== undefined) {
      if (start > size) {
        start = size;
      }
      offset += start;
      size -= start;
    }
    if (end !== undefined) {
      if (end < 0) {
        end = size + end;
      }
      size = end - start;
    }
    return Blob.create({
      blobId: this._blobId,
      offset,
      size,
    });
  }

  /**
   * This method is in the standard, but not actually implemented by
   * any browsers at this point. It's important for how Blobs work in
   * React Native, however, because consumers need to explicitly
   * de-allocate them using this method.
   *
   * Note that the semantics around Blobs created via `blob.slice()`
   * and `new Blob([blob])` are different. `blob.slice()` creates a
   * new *view* onto the same binary data, so calling `close()` on any
   * of those views is enough to deallocate the data, whereas
   * `new Blob([blob, ...])` actually copies the data in memory.
   */
  close() {
    NativeModules.BlobManager.release(this._blobId);
  }

}
