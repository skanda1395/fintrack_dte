import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LandingPage', () => {
  test('renders the main heading correctly', () => {
    renderWithRouter(<LandingPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Take Control of Your Finances with FinTrack/i,
    });

    expect(mainHeading).toBeInTheDocument();
  });

  test('renders the subheading text', () => {
    renderWithRouter(<LandingPage />);

    const subHeading = screen.getByText(
      /Effortlessly track expenses, manage budgets, and gain insights/i
    );

    expect(subHeading).toBeInTheDocument();
  });

  test('renders the "Get Started" link and verifies its destination', () => {
    renderWithRouter(<LandingPage />);

    const getStartedLink = screen.getByRole('link', {
      name: /Get Started/i,
    });

    expect(getStartedLink).toBeInTheDocument();

    expect(getStartedLink).toHaveAttribute('href', '/login');
  });
});
