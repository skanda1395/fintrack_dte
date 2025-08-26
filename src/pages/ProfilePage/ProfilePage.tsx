import React from 'react';
import { Box, Typography, Paper, Grid, Avatar, Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Typography>Loading user profile...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 800,
        mx: 'auto',
        mt: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            mx: 'auto',
            mb: 2,
            fontSize: '3rem',
          }}
          role="img"
          aria-label={
            user.name ? `User avatar for ${user.name}` : 'User profile avatar'
          }
        >
          {user.name ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            <AccountCircleIcon sx={{ fontSize: '3rem' }} />
          )}
        </Avatar>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Hello, {user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to your FinTrack profile.
        </Typography>

        <Grid
          container
          spacing={3}
          alignItems="center"
          sx={{ mb: 4 }}
          role="list"
        >
          <Grid
            size={{ xs: 12, sm: 4 }}
            sx={{ textAlign: { xs: 'center', sm: 'right' } }}
            role="listitem"
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontWeight: 'medium' }}
            >
              Name:
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 8 }}
            sx={{ textAlign: { xs: 'center', sm: 'left' } }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              {user.name}
            </Typography>
          </Grid>

          <Grid
            size={{ xs: 12, sm: 4 }}
            sx={{ textAlign: { xs: 'center', sm: 'right' } }}
            role="listitem"
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontWeight: 'medium' }}
            >
              Email:
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 8 }}
            sx={{ textAlign: { xs: 'center', sm: 'left' } }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              {user.email}
            </Typography>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          sx={{
            mt: 1,
            px: 4,
            py: 1.2,
            borderRadius: '8px',
            textTransform: 'capitalize',
            fontWeight: 'medium',
          }}
          onClick={() => alert('Edit Profile (to be implemented)')}
          aria-label="Edit your profile"
        >
          Edit Profile
        </Button>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
