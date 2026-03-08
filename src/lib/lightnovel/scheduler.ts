/**
 * 请求调度器 - 基于令牌桶算法的速率限制
 * 用于控制对网站的请求频率，避免被限制
 */

import type { SchedulerConfig } from './types';

export class RequestScheduler {
  private delayMs: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private lastRequestTime: number = 0;
  private isPaused: boolean = false;

  constructor(config: SchedulerConfig = {}) {
    this.delayMs = config.delayMs ?? 300;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  /**
   * 等待直到可以发起下一个请求
   */
  async waitForNextRequest(): Promise<void> {
    while (this.isPaused) {
      await this.sleep(100);
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.delayMs) {
      await this.sleep(this.delayMs - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * 执行带重试的请求
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string = 'request',
  ): Promise<T> {
    let lastError: Error | unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.waitForNextRequest();
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(
          `[RequestScheduler] ${operationName} failed (attempt ${attempt}/${this.maxRetries}):`,
          error,
        );

        if (attempt < this.maxRetries) {
          const backoffDelay = this.retryDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(backoffDelay);
        }
      }
    }

    throw new Error(
      `[RequestScheduler] ${operationName} failed after ${this.maxRetries} attempts: ${lastError}`,
    );
  }

  /**
   * 暂停调度器
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * 恢复调度器
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * 检查是否暂停
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * 设置请求延迟
   */
  setDelay(delayMs: number): void {
    this.delayMs = Math.max(100, delayMs);
  }

  /**
   * 获取当前请求延迟
   */
  getDelay(): number {
    return this.delayMs;
  }

  /**
   * 睡眠指定毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
