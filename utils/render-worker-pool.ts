export interface RenderWorkerLike {
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  postMessage(message: unknown): void;
  terminate(): void | Promise<void>;
}

type WorkerSuccessMessage = {
  id: number;
  ok: true;
  data: ArrayBuffer | Uint8Array;
};

type WorkerErrorMessage = {
  id: number;
  ok: false;
  error: string;
};

type WorkerResponseMessage = WorkerSuccessMessage | WorkerErrorMessage;

interface QueuedJob<TPayload> {
  id: number;
  payload: TPayload;
  resolve: (buffer: Buffer) => void;
  reject: (error: Error) => void;
}

interface PoolWorker<TPayload> {
  worker: RenderWorkerLike;
  busy: boolean;
  currentJob: QueuedJob<TPayload> | null;
}

interface RenderWorkerPoolOptions {
  size: number;
  createWorker: () => RenderWorkerLike;
}

function toBuffer(data: ArrayBuffer | Uint8Array): Buffer {
  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }
  return Buffer.from(data);
}

function errorMessage(event: unknown): string {
  if (event instanceof Error) return event.message;
  if (typeof event === "object" && event && "message" in event) {
    return String((event as { message: unknown }).message);
  }
  return "Worker failed";
}

export class RenderWorkerPool<TPayload> {
  private readonly workers: PoolWorker<TPayload>[];
  private readonly queue: QueuedJob<TPayload>[] = [];
  private nextJobId = 1;

  constructor(private readonly options: RenderWorkerPoolOptions) {
    if (!Number.isInteger(options.size) || options.size < 1) {
      throw new Error("RenderWorkerPool size must be at least 1");
    }

    this.workers = Array.from({ length: options.size }, () => this.createPoolWorker());
  }

  run(payload: TPayload): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const job: QueuedJob<TPayload> = {
        id: this.nextJobId++,
        payload,
        resolve,
        reject,
      };

      const idleWorker = this.workers.find((poolWorker) => !poolWorker.busy);
      if (idleWorker) {
        this.startJob(idleWorker, job);
        return;
      }

      this.queue.push(job);
    });
  }

  stats() {
    return {
      size: this.workers.length,
      busy: this.workers.filter((poolWorker) => poolWorker.busy).length,
      queued: this.queue.length,
    };
  }

  async close(): Promise<void> {
    await Promise.all(this.workers.map(({ worker }) => worker.terminate()));
  }

  private createPoolWorker(): PoolWorker<TPayload> {
    const poolWorker: PoolWorker<TPayload> = {
      worker: this.options.createWorker(),
      busy: false,
      currentJob: null,
    };

    poolWorker.worker.onmessage = (event) => {
      this.handleWorkerMessage(poolWorker, event.data);
    };
    poolWorker.worker.onerror = (event) => {
      this.handleWorkerFailure(poolWorker, new Error(errorMessage(event)));
    };

    return poolWorker;
  }

  private startJob(poolWorker: PoolWorker<TPayload>, job: QueuedJob<TPayload>) {
    poolWorker.busy = true;
    poolWorker.currentJob = job;
    poolWorker.worker.postMessage({
      id: job.id,
      payload: job.payload,
    });
  }

  private handleWorkerMessage(poolWorker: PoolWorker<TPayload>, data: unknown) {
    const message = data as WorkerResponseMessage;
    const job = poolWorker.currentJob;

    if (!job || message.id !== job.id) {
      return;
    }

    poolWorker.busy = false;
    poolWorker.currentJob = null;

    if (message.ok) {
      job.resolve(toBuffer(message.data));
    } else {
      job.reject(new Error(message.error));
    }

    this.dispatchNext(poolWorker);
  }

  private handleWorkerFailure(poolWorker: PoolWorker<TPayload>, error: Error) {
    const job = poolWorker.currentJob;
    poolWorker.busy = false;
    poolWorker.currentJob = null;

    if (job) {
      job.reject(error);
    }

    this.dispatchNext(poolWorker);
  }

  private dispatchNext(poolWorker: PoolWorker<TPayload>) {
    const nextJob = this.queue.shift();
    if (nextJob) {
      this.startJob(poolWorker, nextJob);
    }
  }
}
