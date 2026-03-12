import { logger } from './logger';

class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private renderCounts: Map<string, number> = new Map();

  startTimer(label: string) {
    this.timers.set(label, performance.now());
  }

  endTimer(label: string) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      logger.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
      this.timers.delete(label);
      
      // Warn if operation takes more than 100ms
      if (duration > 100) {
        logger.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    }
  }

  trackRender(componentName: string) {
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);
    
    if (count > 0 && count % 10 === 0) {
      logger.warn(`Component ${componentName} has rendered ${count + 1} times`);
    }
  }

  measureAsync<T>(label: string, asyncFn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        this.startTimer(label);
        const result = await asyncFn();
        this.endTimer(label);
        resolve(result);
      } catch (error) {
        this.endTimer(label);
        reject(error);
      }
    });
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      logger.log(`Memory: Used ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB, ` +
                 `Total ${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`);
    }
  }

  clear() {
    this.timers.clear();
    this.renderCounts.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Performance hook for components
export const usePerformanceTracking = (componentName: string) => {
  const trackRender = () => {
    performanceMonitor.trackRender(componentName);
  };

  return { trackRender };
};
