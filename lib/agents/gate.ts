/** Deferred promise used to pass results between parallel agent chains. */
export function createGate<T>() {
  let settled = false;
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = (value: T) => {
      if (settled) return;
      settled = true;
      res(value);
    };
    reject = (reason?: unknown) => {
      if (settled) return;
      settled = true;
      rej(reason);
    };
  });

  return { promise, resolve, reject };
}
