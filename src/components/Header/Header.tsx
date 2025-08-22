import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
  Drawer,
  List,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isProfileMenuOpen = Boolean(profileMenuAnchorEl);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleMobileMenuToggle = (open: boolean) => () => {
    setIsMobileMenuOpen(open);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            color="inherit"
            aria-label="open mobile navigation menu"
            onClick={handleMobileMenuToggle(true)}
            aria-controls="mobile-menu-drawer"
            aria-expanded={isMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            id="mobile-menu-drawer"
            anchor="left"
            open={isMobileMenuOpen}
            onClose={handleMobileMenuToggle(false)}
          >
            <Box
              sx={{ width: 250 }}
              role="presentation"
              onClick={handleMobileMenuToggle(false)}
              onKeyDown={handleMobileMenuToggle(false)}
            >
              <List component="nav" aria-label="mobile navigation">
                {topNavItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    selected={location.pathname === item.path}
                  >
                    {item.text}
                  </MenuItem>
                ))}
              </List>
            </Box>
          </Drawer>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}
        >
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            aria-label="FinTrack home page"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="span"
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
                alt=""
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
            FinTrack
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' } }} component="nav" aria-label="main navigation">
          {topNavItems.map((item) => (
            <Button
              key={item.text}
              component={RouterLink}
              to={item.path}
              sx={{
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                mx: 1,
                textTransform: 'capitalize',
                fontWeight: location.pathname === item.path ? 'bold' : 'medium',
                borderBottom: location.pathname === item.path ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                paddingBottom: '6px',
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        <ThemeToggleButton />
        {user ? (
          <IconButton
            color="inherit"
            id="profile-menu-button"
            aria-label="open user profile menu"
            onClick={handleProfileMenuClick}
            aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen}
          >
            <AccountCircleIcon />
          </IconButton>
        ) : (
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
            aria-label="Login to your account"
            sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}
          >
            Login
          </Button>
        )}

        <Menu
          id="profile-menu"
          anchorEl={profileMenuAnchorEl}
          open={isProfileMenuOpen}
          onClose={handleProfileMenuClose}
          MenuListProps={{
            'aria-labelledby': 'profile-menu-button',
          }}
        >
          <MenuItem
            onClick={handleProfileMenuClose}
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
