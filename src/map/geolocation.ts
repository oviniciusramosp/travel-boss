/** Retry unavailable high-accuracy fixes using the browser's default provider. */
export function watchLocation(
  geo: Geolocation,
  success: PositionCallback,
  failure: PositionErrorCallback,
): () => void {
  let watch: number | null = null;
  let generation = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
    generation += 1;
    if (watch != null) geo.clearWatch(watch);
    watch = null;
  };
  const start = (highAccuracy: boolean) => {
    const seq = ++generation;
    watch = geo.watchPosition(position => {
      if (!stopped && seq === generation) success(position);
    }, error => {
      if (stopped || seq !== generation) return;
      if (highAccuracy && (error.code === 2 || error.code === 3)) {
        if (watch != null) geo.clearWatch(watch);
        watch = null;
        start(false);
      } else {
        stop();
        failure(error);
      }
    }, { enableHighAccuracy: highAccuracy, maximumAge: 5000, timeout: highAccuracy ? 15000 : 30000 });
  };
  start(true);
  return stop;
}
