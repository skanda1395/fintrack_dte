import React from 'react';
import { Box, Typography } from '@mui/material';

const Budgets: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Budgets Page
      </Typography>
      <Typography variant="body1">Welcome to your budgets!</Typography>
    </Box>
  );
};

export default Budgets;
