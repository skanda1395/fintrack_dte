import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 0px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.default',
        p: 4,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 3,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
            lineHeight: 1.1,
          }}
        >
          Take Control of Your Finances with{' '}
          <Box
            component="span"
            sx={{
              background:
                'linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            FinTrack
          </Box>
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{
            color: 'text.secondary',
            mb: 5,
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            maxWidth: '700px',
            mx: 'auto',
          }}
        >
          Effortlessly track expenses, manage budgets, and gain insights into
          your spending habits.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/login"
          sx={{
            mt: 2,
            px: 5,
            py: 1.5,
            borderRadius: '8px',
            textTransform: 'capitalize',
            fontWeight: 'medium',
            fontSize: '1.1rem',
          }}
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
};

export default LandingPage;
