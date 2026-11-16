export type CarouselImageQueue = {
  requested: readonly number[];
  settled: readonly number[];
};

/** Mount one background image at a time, only after all current requests have settled. */
function requestNext<T extends CarouselImageQueue>(state: T, available: readonly boolean[]): T {
  if (!state.settled.includes(0) || !state.requested.every(index => state.settled.includes(index))) return state;
  const next = available.findIndex((exists, index) => exists && !state.requested.includes(index));
  return next < 0 ? state : { ...state, requested: [...state.requested, next] };
}

export function initialImageQueue(available: readonly boolean[]): CarouselImageQueue {
  return requestNext({
    requested: available.length ? [0] : [],
    settled: available.flatMap((exists, index) => exists ? [] : [index]),
  }, available);
}

/** Both load and error release the queue; navigation can independently request an active image. */
export function settleImage<T extends CarouselImageQueue>(state: T, index: number, available: readonly boolean[]): T {
  if (state.settled.includes(index) || !state.requested.includes(index)) return state;
  return requestNext({ ...state, settled: [...state.settled, index] }, available);
}
