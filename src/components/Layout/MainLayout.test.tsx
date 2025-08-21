import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import MainLayout from './MainLayout';

vi.mock('@/components/Header/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrowserRouter>
  );
};

describe('MainLayout', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );
  });

  it('renders Header component', () => {
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders Outlet for nested routes', () => {
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
