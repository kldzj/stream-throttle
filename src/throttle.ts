import { Transform, TransformCallback } from 'node:stream';
import { ThrottleGroup, ThrottleOptions } from './group';

export class Throttle extends Transform {
  private _group: ThrottleGroup;

  public get group(): ThrottleGroup {
    return this._group;
  }

  constructor(opts: ThrottleOptions, group?: ThrottleGroup) {
    super();
    this._group = group ?? new ThrottleGroup(opts);
  }

  public _transform(chunk: any, _encoding: BufferEncoding, callback: TransformCallback): void {
    this._process(chunk, 0, callback);
  }

  private _process(chunk: any, position: number, callback: TransformCallback): void {
    const newPosition = position + this._group.chunkSize;
    const slice = chunk.slice(position, newPosition);
    if (!slice.length) {
      callback();
      return;
    }

    this.group.bucket
      .removeTokens(slice.length)
      .then(() => {
        this.push(slice);
        return this._process(chunk, newPosition, callback);
      })
      .catch((err) => {
        callback(err);
      });
  }
}
