import { Throttle, ThrottleOptions } from '../src';

export const options: ThrottleOptions = { rate: 10000 };

export function testThrottle(toBeSent: string, throttle = new Throttle(options)): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let received = '';
    throttle.on('error', reject);
    throttle.on('data', (str) => (received += str));
    throttle.on('end', () => resolve(received === toBeSent));
    throttle.write(toBeSent, (err) => {
      if (err) {
        reject(err);
      }

      throttle.end();
    });
  });
}

export function timedThrottleTest(str: string, throttle = new Throttle(options)): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    testThrottle(str, throttle)
      .then(() => {
        const end = Date.now();
        const dur = end - start;
        resolve(dur < (str.length / options.rate + 0.75) * 1000 && dur > (str.length / options.rate - 0.75) * 1000);
      })
      .catch(reject);
  });
}
