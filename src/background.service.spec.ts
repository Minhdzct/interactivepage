import { describe, it, expect, vi } from 'vitest';
import { BackgroundService } from './background.service';

describe('BackgroundService', () => {
  it('thêm và xóa công thức khỏi nền', async () => {
    vi.useFakeTimers();
    (global as any).requestAnimationFrame = (cb: Function) => cb();

    const service = new BackgroundService();
    (service as any).FORMULA_EXAMPLES = ['ab'];
    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const promise = (service as any).addAndAnimateNewFormula();

    expect(service.backgroundFormulas().length).toBe(1);

    await vi.runAllTimersAsync();
    await promise;

    expect(service.backgroundFormulas().length).toBe(0);

    mathRandomSpy.mockRestore();
    vi.useRealTimers();
  });
});
