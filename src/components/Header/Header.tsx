import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import ThemeToggleButton from '@/components/ThemeToggle/ThemeToggleButton';
import { useAuth } from '@/contexts/AuthContext';

interface TopNavItem {
  text: string;
  path: string;
}

const topNavItems: TopNavItem[] = [
  { text: 'Dashboard', path: '/dashboard' },
  { text: 'Transactions', path: '/transactions' },
  { text: 'Budgets', path: '/budgets' },
  { text: 'Categories', path: '/categories' },
  { text: 'Reports', path: '/reports' },
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: '#0D0F1C',
        borderBottom: '1px solid #E5E8EB',
        boxShadow: 'none',
      }}
    >
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              p: 0.5,
            }}
          >
            <img
              src="/fintrack_logo.svg"
              alt="App Logo"
              style={{ width: '100%', height: '100%' }}
            />
          </Box>

          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            FinTrack
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {topNavItems.map((item) => (
            <Button
              key={item.text}
              component={RouterLink}
              to={item.path}
              sx={{
                color: 'inherit',
                mx: 1,
                textTransform: 'capitalize',
                fontWeight: 'medium',
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        <ThemeToggleButton />
        <IconButton color="inherit" aria-label="notifications">
          <NotificationsIcon />
        </IconButton>

        {user ? (
          <IconButton
            color="inherit"
            aria-label="profile menu"
            onClick={handleMenuClick}
            aria-controls={open ? 'profile-menu' : undefined}
            aria-haspopup="true"
          >
            <AccountCircleIcon />
          </IconButton>
        ) : (
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
            sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}
          >
            Login
          </Button>
        )}

        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'profile-menu-button',
          }}
        >
          <MenuItem
            onClick={handleMenuClose}
            component={RouterLink}
            to="/profile"
          >
            My Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
