import React from 'react';
import { Box, Typography } from '@mui/material';

const Transactions: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Transactions Page
      </Typography>
      <Typography variant="body1">Welcome to your transactions!</Typography>
    </Box>
  );
};

export default Transactions;
