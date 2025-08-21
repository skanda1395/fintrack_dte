import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { CustomThemeProvider, useThemeContext } from './ThemeContext';

vi.mock('@mui/material/styles', () => ({
  ThemeProvider: vi.fn(({ theme, children }) => (
    <div data-testid="mui-theme-provider" data-theme-mode={theme.palette.mode}>
      {children}
    </div>
  )),
}));
vi.mock('@mui/material', () => ({
  CssBaseline: vi.fn(() => <div data-testid="css-baseline" />),
}));

vi.mock('@/theme', () => {
  const mockLightTheme = { palette: { mode: 'light' } };
  const mockDarkTheme = { palette: { mode: 'dark' } };
  return {
    lightTheme: mockLightTheme,
    darkTheme: mockDarkTheme,
  };
});

const TestComponent = () => {
  const { mode, toggleThemeMode } = useThemeContext();
  return (
    <div>
      <span data-testid="theme-mode">{mode}</span>
      <button onClick={toggleThemeMode}>Toggle Theme</button>
    </div>
  );
};

describe('CustomThemeProvider', () => {
  it('should render children and initialize with light theme', () => {
    render(
      <CustomThemeProvider>
        <TestComponent />
      </CustomThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toBeInTheDocument();
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('mui-theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('css-baseline')).toBeInTheDocument();
    expect(screen.getByTestId('mui-theme-provider')).toHaveAttribute(
      'data-theme-mode',
      'light'
    );
  });

  it('should toggle the theme mode from light to dark and back', () => {
    render(
      <CustomThemeProvider>
        <TestComponent />
      </CustomThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    const themeModeSpan = screen.getByTestId('theme-mode');
    const muiThemeProvider = screen.getByTestId('mui-theme-provider');

    expect(themeModeSpan).toHaveTextContent('light');
    expect(muiThemeProvider).toHaveAttribute('data-theme-mode', 'light');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(themeModeSpan).toHaveTextContent('dark');
    expect(muiThemeProvider).toHaveAttribute('data-theme-mode', 'dark');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(themeModeSpan).toHaveTextContent('light');
    expect(muiThemeProvider).toHaveAttribute('data-theme-mode', 'light');
  });

  it('should throw an error if useThemeContext is used outside the provider', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useThemeContext must be used within a CustomThemeProvider'
    );

    consoleErrorSpy.mockRestore();
  });
});
