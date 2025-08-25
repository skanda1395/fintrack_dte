# FinTrack

A finance tracker application built with React and Material-UI. FinTrack helps users manage their expenses, track transactions, set budgets, and view financial reports with a clean and intuitive user interface.

![FinTrack](https://github.com/skanda1395/fintrack_dte/public/landing_page.png "FinTrack landing page")

## 🚀 Features  

- **Financial Tracking**: Easily add, categorize, and manage your income and expenses.
- **MUI Integration:** Leverages Material-UI for a consistent and customizable design system.
- **Smart Budgets:** Create and track budgets for different spending categories.
- **Data Visualization:** View your financial data with clear and concise charts and reports. 📊
- **Intuitive UI:** A clean and user-friendly design built on the Material-UI framework.
- **Google Fonts (Inter):** Utilizes the Inter font family for modern and readable typography.
- **Robust Testing Setup:** Configured with Vitest and React Testing Library for reliable unit testing of components.
- **Theme Toggling:** Supports light and dark modes with a dedicated toggle button.


## 🛠️ Technologies Used

- **React:** Frontend JavaScript library for building user interfaces.
- **TypeScript:** Typed superset of JavaScript for enhanced code quality and maintainability.
- **Material-UI (MUI):** Comprehensive React UI framework for pre-built components and a robust theming system.
- **React Router DOM:** For declarative routing in the application.
- **React Query:** For declarative data fetching, caching, and synchronization.
- **Vitest:** A modern and fast testing framework for React .
- **React Testing Library:** Utilities for testing React components in a user-centric way.
- **Google Fonts:** For custom web fonts.

## ⚙️ Setup & Installation

Follow these steps to get the FinTrack project up and running on your local machine.

1.  git clone ```REPO_URL```
2.  npm install or yarn install

## 🚀 Running the Application

To start the development server:

```js
npm start  or  yarn start
```

This will open the application in your browser at http://localhost:5173 (or another available port).

## ✅ Running Tests

To execute the unit tests for the application:

```js
npm test  or  yarn test
```

This will run Vitest in watch mode, rerunning tests when files change. Press q to quit.

## 📂 Project Structure

This project follows a standard and scalable file structure.

- ```src/components```: Reusable UI components.
- ```src/pages```: Top-level components that correspond to different routes.
- ```src/contexts```: React context providers for global state management (e.g., Auth, Theme).
- ```src/hooks```: Custom React hooks, including data fetching logic using React Query.
- ```src/interfaces```: TypeScript interfaces for data models.
- ```src/theme```: Theme configuration for Material-UI.
- ```src/assets```: Static assets like images and fonts.
- ```src/services```: Functions for interacting with external APIs, databases, or services.
- ```src/theme```: Theme configuration for Material-UI.
- ```src/assets```: Static assets like images and fonts.