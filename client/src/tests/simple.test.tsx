import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

describe('Frontend Test Infrastructure', () => {
  it('JSDOM, @testing-library/react and Vitest globals work together', () => {
    let clicked = false;
    render(
      <button onClick={() => { clicked = true; }}>SkillAnchor Test</button>
    );
    const btn = screen.getByRole('button', { name: 'SkillAnchor Test' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(clicked).toBe(true);
  });
});
