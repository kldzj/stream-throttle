## stream-throttle

A simple Node.js stream throttler.

### Installation

Using yarn:

```sh-session
$ yarn add @kldzj/stream-throttle
```

Using npm:

```sh-session
$ npm i -S @kldzj/stream-throttle
```

### Usage

#### Options

- `rate`: The rate in bytes per second at which to emit data.
- `burst`: The burst rate in bytes per second. Must be less than or equal to `rate`. Defaults to `rate`.
- `chunkSize`: The size of chunks to split the received data into. Must be less than or equal to `rate`. Defaults to `rate / 10`.

#### `Throttle`

Used to throttle the output rate of a single stream.

```typescript
import { Throttle } from '@kldzj/stream-throttle';

const throttle = new Throttle({ rate: 10 });
process.stdin.pipe(throttle).pipe(process.stdout);
```

#### `ThrottleGroup`

Used to throttle the output rate across multiple streams.

```typescript
import { createConnection } from 'net';
import { ThrottleGroup } from '@kldzj/stream-throttle';

const group = new ThrottleGroup({ rate: 1024 * 1024 });
const addr = { host: 'www.google.com', port: 80 };
const throttled1 = createConnection(addr).pipe(group.createThrottle());
const throttled2 = createConnection(addr).pipe(group.createThrottle());
// ...
```

#### Changing the rate on-the-fly

```typescript
const group = new ThrottleGroup({ rate: 1024 * 1024 });
// or group = new Throttle({ rate: 1024 * 1024 }).group;
// ...

group.setRate(4 * 1024 * 1024);
// in case you calculate the chunkSize differently
// you should call `setChunkSize` as well, as `setRate`
// recalculates `chunkSize`
group.setChunkSize(group.rate / 6);
// in addition, you can also call `setBurst` if
// you want to change the burst rate
group.setBurst(group.rate * 1.5);

// ...
```

## Special thanks

- [@tjgq](https://github.com/tjgq) for the initial implementation ([`stream-throttle`](https://github.com/tjgq/node-stream-throttle)).
