import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggleButton from './ThemeToggleButton';
import { useThemeContext } from '@/contexts/ThemeContext';

vi.mock('@/contexts/ThemeContext', () => ({
  useThemeContext: vi.fn(),
}));

describe('ThemeToggleButton', () => {
  const mockToggleThemeMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the correct icon and tooltip for light mode', () => {
    vi.mocked(useThemeContext).mockReturnValue({
      mode: 'light',
      toggleThemeMode: mockToggleThemeMode,
    });

    render(<ThemeToggleButton />);

    expect(screen.getByLabelText('switch to dark mode')).toBeInTheDocument();
  });

  it('should render the correct icon and tooltip for dark mode', () => {
    vi.mocked(useThemeContext).mockReturnValue({
      mode: 'dark',
      toggleThemeMode: mockToggleThemeMode,
    });

    render(<ThemeToggleButton />);

    expect(screen.getByLabelText('switch to light mode')).toBeInTheDocument();
  });

  it('should call toggleThemeMode when the button is clicked', () => {
    vi.mocked(useThemeContext).mockReturnValue({
      mode: 'light',
      toggleThemeMode: mockToggleThemeMode,
    });

    render(<ThemeToggleButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleThemeMode).toHaveBeenCalledTimes(1);
  });
});
