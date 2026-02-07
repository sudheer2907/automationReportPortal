import React, { useState } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Alert, Paper, MenuItem } from '@mui/material';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { protocol, hostname } = window.location;
  const API_BASE_URL = `${protocol}//${hostname}:5000`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, { username, password, role });
      setMessage('User registered!');
      setError('');
    } catch (err) {
      setError('Registration failed');
      setMessage('');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Register User</Typography>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth margin="normal" required />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required />
          <TextField select label="Role" value={role} onChange={e => setRole(e.target.value)} fullWidth margin="normal">
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
        </Box>
      </Paper>
    </Container>
  );
}
