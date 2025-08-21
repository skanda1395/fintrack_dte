import React from 'react';
import { Box, Typography } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Dashboard Page
      </Typography>
      <Typography variant="body1">Welcome to your dashboard!</Typography>
    </Box>
  );
};

export default Dashboard;
