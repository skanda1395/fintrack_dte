import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import Header from '@/components/Header/Header';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: { xs: '76px', sm: '86px' },
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
