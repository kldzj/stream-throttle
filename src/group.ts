import { TokenBucket } from 'limiter';
import { Throttle } from './throttle';

export interface ThrottleOptions {
  rate: number;
  chunkSize?: number;
}

export class ThrottleGroup {
  private _rate: number;
  private _bucket: TokenBucket;
  private _chunkSize: number;

  public get rate(): number {
    return this._rate;
  }

  public get bucket(): TokenBucket {
    return this._bucket;
  }

  public get chunkSize(): number {
    return this._chunkSize;
  }

  constructor(options: ThrottleOptions) {
    if (options.rate <= 0) {
      throw new Error('Rate must be greater than 0');
    }

    if (options.chunkSize !== undefined && options.chunkSize <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }

    if (options.chunkSize && options.chunkSize > options.rate) {
      throw new Error('Chunk size must be less than or equal to the rate');
    }

    this._rate = options.rate;
    this._chunkSize = options.chunkSize ?? this.calculateChunkSize(this.rate);
    this._bucket = new TokenBucket({
      tokensPerInterval: options.rate,
      bucketSize: options.rate,
      interval: 'second',
    });
  }

  /**
   * Calling `setRate` will recalculate the chunk size.
   * @param rate The rate of the throttle in bytes per second
   */
  public setRate(rate: number): void {
    this._rate = rate;
    this.bucket.bucketSize = rate;
    this.bucket.tokensPerInterval = rate;
    this._chunkSize = this.calculateChunkSize(rate);
  }

  public setChunkSize(chunkSize: number): void {
    if (chunkSize > this.rate) {
      throw new Error('Chunk size must be less than or equal to the rate');
    }

    this._chunkSize = chunkSize;
  }

  public createThrottle(): Throttle {
    return new Throttle({ rate: this.rate, chunkSize: this.chunkSize }, this);
  }

  private calculateChunkSize(chunkSize: number): number {
    return Math.floor(chunkSize / 10);
  }
}
