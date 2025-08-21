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
  Drawer,
  List,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';

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
        backgroundColor: 'white',
        color: '#0D0F1C',
        borderBottom: '1px solid #E5E8EB',
        boxShadow: 'none',
      }}
    >
      <Toolbar>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
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
              <List>
                {topNavItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
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
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: { xs: 1, md: 1.5 },
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
        {user ? (
          <IconButton
            color="inherit"
            aria-label="profile menu"
            onClick={handleProfileMenuClick}
            aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined}
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
