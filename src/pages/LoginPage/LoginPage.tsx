import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import styles from './LoginPage.module.css';

const initialFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const initialFieldErrors = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setFormData(initialFormData);
    setFieldErrors(initialFieldErrors);
    setFormError('');
    setSuccessMessage('');
  }, [isLogin]);

  const validate = (fieldName: keyof typeof initialFormData, value: string) => {
    let errorMsg = '';
    switch (fieldName) {
      case 'email':
        if (!value) errorMsg = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(value))
          errorMsg = 'Invalid email format.';
        break;
      case 'password':
        if (!value) errorMsg = 'Password is required.';
        else if (value.length < 6)
          errorMsg = 'Password must be at least 6 characters.';
        break;
      case 'name':
        if (!value && !isLogin) errorMsg = 'Name is required.';
        break;
      case 'confirmPassword':
        if (!value && !isLogin) errorMsg = 'Confirm password is required.';
        else if (value !== formData.password && !isLogin)
          errorMsg = 'Passwords do not match.';
        break;
    }
    return errorMsg;
  };

  const validateAllFields = (): boolean => {
    let isValid = true;
    const newFieldErrors = { ...initialFieldErrors };

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (isLogin && (key === 'name' || key === 'confirmPassword')) {
        return;
      }
      const errorMsg = validate(key, formData[key]);
      if (errorMsg) {
        newFieldErrors[key] = errorMsg;
        isValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const errorMsg = validate(name as keyof typeof formData, value);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleToggleFormMode = () => {
    setIsLogin((prev) => !prev);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage('');

    if (!validateAllFields()) {
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setFormError('');

    try {
      let authSuccess: boolean;
      if (isLogin) {
        authSuccess = await login(formData.email, formData.password);
        if (authSuccess) {
          setSuccessMessage('Login successful! Redirecting...');
          navigate('/dashboard');
        } else {
          setFormError('Login failed. Invalid email or password.');
        }
      } else {
        authSuccess = await signup(
          formData.email,
          formData.password,
          formData.name
        );
        if (authSuccess) {
          setSuccessMessage('Signup successful! Redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          setFormError(
            'Signup failed. User might already exist or server error.'
          );
        }
      }
    } catch (err) {
      console.error('Authentication API error:', err);
      setFormError(
        'An unexpected error occurred during authentication. Please try again.'
      );
    }
  };

  return (
    <Box className={styles.pageWrapper}>
      <Container maxWidth="xs">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className={styles.title}
        >
          {isLogin ? 'Welcome to FinTrack' : 'Join FinTrack Today'}
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {formError}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
            {successMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          className={styles.form}
        >
          {!isLogin && (
            <TextField
              label="Name"
              variant="outlined"
              type="text"
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
            />
          )}
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />
          {!isLogin && (
            <TextField
              label="Confirm Password"
              variant="outlined"
              type="password"
              fullWidth
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
            />
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isLogin ? (
              'Login'
            ) : (
              'Sign Up'
            )}
          </Button>
        </Box>
        <Typography variant="body2" className={styles.toggleText}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Button
            onClick={handleToggleFormMode}
            className={styles.toggleButton}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </Button>
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;
