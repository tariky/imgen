import { describe, expect, test } from "bun:test";
import { RenderWorkerPool, type RenderWorkerLike } from "../utils/render-worker-pool";

class FakeWorker implements RenderWorkerLike {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  posted: unknown[] = [];
  terminated = false;

  postMessage(message: unknown) {
    this.posted.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  complete(data: Uint8Array) {
    const message = this.posted.at(-1) as { id: number };
    this.onmessage?.({ data: { id: message.id, ok: true, data } });
  }
}

describe("RenderWorkerPool", () => {
  test("limits active jobs to worker count and starts queued jobs as workers finish", async () => {
    const workers: FakeWorker[] = [];
    const pool = new RenderWorkerPool<{ label: string }>({
      size: 2,
      createWorker: () => {
        const worker = new FakeWorker();
        workers.push(worker);
        return worker;
      },
    });

    const first = pool.run({ label: "first" });
    const second = pool.run({ label: "second" });
    const third = pool.run({ label: "third" });

    expect(workers).toHaveLength(2);
    expect(workers[0]!.posted).toHaveLength(1);
    expect(workers[1]!.posted).toHaveLength(1);
    expect(pool.stats()).toEqual({ size: 2, busy: 2, queued: 1 });

    workers[0]!.complete(new Uint8Array([1, 2, 3]));
    await expect(first).resolves.toEqual(Buffer.from([1, 2, 3]));
    expect(workers[0]!.posted).toHaveLength(2);
    expect(pool.stats()).toEqual({ size: 2, busy: 2, queued: 0 });

    workers[1]!.complete(new Uint8Array([4]));
    workers[0]!.complete(new Uint8Array([5]));

    await expect(second).resolves.toEqual(Buffer.from([4]));
    await expect(third).resolves.toEqual(Buffer.from([5]));
    expect(pool.stats()).toEqual({ size: 2, busy: 0, queued: 0 });

    await pool.close();
    expect(workers.every((worker) => worker.terminated)).toBe(true);
  });

  test("rejects failed worker responses and continues with queued jobs", async () => {
    const workers: FakeWorker[] = [];
    const pool = new RenderWorkerPool<{ label: string }>({
      size: 1,
      createWorker: () => {
        const worker = new FakeWorker();
        workers.push(worker);
        return worker;
      },
    });

    const first = pool.run({ label: "first" });
    const second = pool.run({ label: "second" });
    const firstMessage = workers[0]!.posted.at(-1) as { id: number };

    workers[0]!.onmessage?.({
      data: { id: firstMessage.id, ok: false, error: "render failed" },
    });

    await expect(first).rejects.toThrow("render failed");
    expect(workers[0]!.posted).toHaveLength(2);

    workers[0]!.complete(new Uint8Array([9]));
    await expect(second).resolves.toEqual(Buffer.from([9]));
    expect(pool.stats()).toEqual({ size: 1, busy: 0, queued: 0 });

    await pool.close();
  });
});
