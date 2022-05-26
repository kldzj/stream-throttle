import { options, testThrottle, timedThrottleTest } from '.';
import { Throttle } from '../src';

describe('Throttle', () => {
  it('should throttle', async () => {
    const str = new Array(25000).fill('A').join('');
    expect(await timedThrottleTest(str)).toBe(true);
  });

  it('should be able to change rate', async () => {
    const str = new Array(25000).fill('A').join('');
    const throttle = new Throttle(options);
    const [result] = await Promise.all([
      testThrottle(str, throttle),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          throttle.group.setRate(throttle.group.rate * 2);
          resolve();
        }, 500);
      }),
    ]);

    expect(result).toBe(true);
  });
});
