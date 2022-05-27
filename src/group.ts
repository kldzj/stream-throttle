import { TokenBucket } from 'limiter';
import { Throttle } from './throttle';

export interface ThrottleOptions {
  rate: number;
  burst?: number;
  chunkSize?: number;
}

export class ThrottleGroup {
  private _rate: number;
  private _burst: number;
  private _bucket: TokenBucket;
  private _chunkSize: number;

  public get rate(): number {
    return this._rate;
  }

  public get burst(): number {
    return this._burst;
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

    if (options.burst && options.burst < options.rate) {
      throw new Error('Burst must be greater than or equal to the rate');
    }

    if (options.chunkSize !== undefined && options.chunkSize <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }

    if (options.chunkSize && options.chunkSize > options.rate) {
      throw new Error('Chunk size must be less than or equal to the rate');
    }

    this._rate = options.rate;
    this._burst = options.burst || this.rate;
    this._chunkSize = options.chunkSize ?? this.calculateChunkSize(this.rate);
    this._bucket = new TokenBucket({
      tokensPerInterval: this.rate,
      bucketSize: this.burst,
      interval: 'second',
    });
  }

  /**
   * Update the sustained rate of the throttle.
   * Calling this method will recalculate the chunk size.
   * In case the the burst rate is less than the sustained rate,
   * the burst rate will be set to the updated sustained rate.
   * @param rate The rate of the throttle in bytes per second
   */
  public setRate(rate: number): void {
    rate = Math.floor(rate);
    if (this.bucket.bucketSize < rate) {
      this.bucket.bucketSize = rate;
      this._burst = rate;
    }

    this.bucket.tokensPerInterval = rate;
    this._rate = rate;
    this._chunkSize = this.calculateChunkSize(rate);
  }

  /**
   * Update the burst rate (also known as bucket size) of the throttle.
   * @param burst The burst value of the throttle in bytes per second
   * @throws {Error} If the burst value is less than the rate
   */
  public setBurst(burst: number): void {
    burst = Math.floor(burst);
    if (burst < this.bucket.tokensPerInterval) {
      throw new Error('Burst must be greater than or equal to the rate');
    }

    this.bucket.bucketSize = burst;
    this._burst = burst;
  }

  /**
   * Update the processing chunk size of the throttle.
   * @param chunkSize The chunk size in bytes that received chunks will be split into
   */
  public setChunkSize(chunkSize: number): void {
    chunkSize = Math.floor(chunkSize);
    if (chunkSize > this.rate) {
      throw new Error('Chunk size must be less than or equal to the rate');
    }

    this._chunkSize = chunkSize;
  }

  public createThrottle(): Throttle {
    return new Throttle(this);
  }

  private calculateChunkSize(chunkSize: number): number {
    return Math.floor(chunkSize / 10);
  }
}
