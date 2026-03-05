export class Scheduler {
    private queue: (() => Promise<void>)[] = [];
    private processing = false;
    private lastRun = 0;
    private paused = false;

    constructor(
        private maxPerInterval: number,
        private interval: number
    ) { }

    async run<T>(fn: (controller: { pause: () => void; resume: () => void }) => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await fn({
                        pause: () => { this.paused = true; },
                        resume: () => { this.paused = false; this.process(); }
                    });
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
            this.process();
        });
    }

    private async process() {
        if (this.processing || this.paused || this.queue.length === 0) return;

        const now = Date.now();
        const wait = Math.max(0, this.lastRun + (this.interval / this.maxPerInterval) - now);

        if (wait > 0) {
            setTimeout(() => this.process(), wait);
            return;
        }

        this.processing = true;
        const task = this.queue.shift();
        if (task) {
            this.lastRun = Date.now();
            await task();
        }
        this.processing = false;
        this.process();
    }
}
