import { describe, expect, it } from 'vitest';

import { parseInteractiveMode } from '../src/bin/utils';

describe('parseInteractiveMode', () => {
  it('defaults interactive mode to enabled', () => {
    expect(parseInteractiveMode(undefined)).toBe(true);
  });

  it('allows disabling interactive mode with false', () => {
    expect(parseInteractiveMode('false')).toBe(false);
  });
});
