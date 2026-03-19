import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Frontend Test Infrastructure', () => {
  it('should render a component and find text', () => {
    render(<div>SkillAnchor Test</div>);
    expect(screen.getByText('SkillAnchor Test')).toBeInTheDocument();
  });
});
