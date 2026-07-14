import 'server-only';

type Release = () => void;

const processingState = {
  locked: false,
  waiters: [] as Array<(release: Release) => void>,
};

function releaseSlot() {
  const next = processingState.waiters.shift();

  if (next) {
    next(releaseSlot);
  } else {
    processingState.locked = false;
  }
}

async function acquireSlot(): Promise<Release> {
  if (!processingState.locked) {
    processingState.locked = true;
    return releaseSlot;
  }

  return new Promise((resolve) => processingState.waiters.push(resolve));
}

/**
 * Sharp and GetObject both allocate sizeable buffers. Serialize finalization
 * inside one server process so a normal multi-select cannot exhaust memory.
 */
export async function withMediaProcessingSlot<T>(
  operation: () => Promise<T>
): Promise<T> {
  const release = await acquireSlot();

  try {
    return await operation();
  } finally {
    release();
  }
}
