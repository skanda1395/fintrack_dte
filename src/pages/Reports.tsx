import React from 'react';
import { Box, Typography } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Reports Page
      </Typography>
      <Typography variant="body1">Welcome to your reports!</Typography>
    </Box>
  );
};

export default Reports;
