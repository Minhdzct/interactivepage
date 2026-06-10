import { describe, it, expect } from 'vitest';
import { GuideService } from './guide.service';

describe('GuideService', () => {
  it('trả về commentary đúng cho cardId đã biết', async () => {
    const service = new GuideService();
    const text = await service.getGuidance('personal-info-card');
    expect(text).toContain('𝐌𝐢𝐧𝐚𝐭𝐨');
  });

  it('trả về fallback cho cardId không tồn tại', async () => {
    const service = new GuideService();
    const text = await service.getGuidance('unknown-card');
    expect(text).toBe(
      "No specific commentary available for this item. It appears to be a standard portfolio entry within the subject's collection."
    );
  });
});
