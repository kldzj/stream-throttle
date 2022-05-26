import { options, testThrottle, timedThrottleTest } from '.';
import { ThrottleGroup } from '../src';

describe('Throttle', () => {
  it('should throttle', async () => {
    const numberOfTests = 3;
    const str = new Array(25000).fill('A').join('');
    const group = new ThrottleGroup({ rate: options.rate * numberOfTests });
    const results = await Promise.all(
      new Array(numberOfTests).fill(0).map(() => timedThrottleTest(str, group.createThrottle()))
    );
    console.debug({ results });
    expect(results.some((result) => result)).toBe(true);
  });

  it('should be able to change rate', async () => {
    const str = new Array(10000).fill('A').join('');
    const group = new ThrottleGroup(options);
    const results = await Promise.all([
      testThrottle(str, group.createThrottle()),
      testThrottle(str, group.createThrottle()),
      testThrottle(str, group.createThrottle()),
      new Promise<true>((resolve) => {
        setTimeout(() => {
          group.setRate(group.rate * 3);
          resolve(true);
        }, 500);
      }),
    ]);

    expect(results.every((result) => result)).toBe(true);
  });
});
