import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '@/contexts/ThemeContext';

const ThemeToggleButton: React.FC = () => {
  const { mode, toggleThemeMode } = useThemeContext();

  return (
    <Tooltip
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <IconButton sx={{ ml: 1 }} onClick={toggleThemeMode} color="inherit" aria-label={`switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
