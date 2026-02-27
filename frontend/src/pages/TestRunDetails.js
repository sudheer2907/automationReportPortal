import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, List, ListItem, ListItemText, Button, Collapse, Divider, ImageList, ImageListItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ImageIcon from '@mui/icons-material/Image';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
import { downloadTestResultsAsExcel } from './excelExporter';

export default function TestRunDetails({ role, token }) {
  const { runId, project } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const effectiveRole = role || localStorage.getItem('role');
  const authToken = token || localStorage.getItem('token');
  const isAdmin = effectiveRole === 'admin';

  const { protocol, hostname } = window.location;
  const API_BASE_URL = `${protocol}//${hostname}:5000`;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/results`)
      .then(res => res.json())
      .then(data => {
        // Decode params and match with original data
        const decodedRunId = decodeURIComponent(runId);
        const decodedProject = decodeURIComponent(project);
        setResults(data.filter(r => {
          let formattedRunId = r.run_id;
          if (/^\d{13,}$/.test(r.run_id)) {
            const date = new Date(Number(r.run_id));
            formattedRunId = date.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-').replace(',', '');
          }
          return (formattedRunId === decodedRunId || r.run_id === decodedRunId) && (r.framework === decodedProject || !decodedProject);
        }));
      });
  }, [runId, project]);

  const passed = results.filter(r => r.status === 'passed');
  const failed = results.filter(r => r.status === 'failed');

  const handleExpand = idx => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (!isAdmin) {
        alert('Only admin users can delete executions.');
        setOpenDeleteDialog(false);
        return;
      }

      if (!authToken) {
        alert('Your session has expired. Please login again.');
        setOpenDeleteDialog(false);
        navigate('/login');
        return;
      }

      const actualRunId = results.length > 0 ? results[0].run_id : runId;

      const response = await fetch(`${API_BASE_URL}/api/results/run/${encodeURIComponent(actualRunId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success! ${data.deletedCount} test result(s) deleted.`);
        setOpenDeleteDialog(false);
        navigate('/dashboard');
      } else if (response.status === 401) {
        alert('Session invalid or expired. Please login again.');
        setOpenDeleteDialog(false);
        navigate('/login');
      } else if (response.status === 403) {
        alert('Forbidden: Only admins can delete executions');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete execution'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        <Typography variant="h5" gutterBottom>Test Run Details</Typography>
        <Typography variant="subtitle1" gutterBottom>Project: {project || 'Unknown'} | Run ID: {runId}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<GetAppIcon />}
            onClick={() => downloadTestResultsAsExcel(results, runId, project)}
            sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
          >
            Download as Excel
          </Button>
          {isAdmin && (
            <Button 
              variant="contained" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              disabled={results.length === 0}
            >
              Delete Execution
            </Button>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Passed Test Cases</Typography>
        <List dense>
          {passed.map((r, i) => (
            <ListItem key={i}><ListItemText primary={r.testName} secondary={r.suite} /></ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Failed Test Cases</Typography>
        <List dense>
          {failed.map((r, i) => (
            <React.Fragment key={i}>
              <ListItem button onClick={() => handleExpand(i)}>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ErrorOutlineIcon color="error" fontSize="small" />
                      <span>{r.testName}</span>
                      {r.screenshots && r.screenshots.length > 0 && (
                        <ImageIcon color="primary" fontSize="small" titleAccess={`${r.screenshots.length} screenshot(s) available`} />
                      )}
                    </Box>
                  }
                  secondary={r.suite} 
                />
              </ListItem>
              <Collapse in={!!expanded[i]} timeout="auto" unmountOnExit>
                <Box sx={{ ml: 2, mr: 2, mb: 2 }}>
                  {/* Error Message */}
                  <Box sx={{ color: 'red', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13, background: '#fff0f0', borderRadius: 1, p: 2, border: '1px solid #f44336', mt: 1 }}>
                    <b>Failure Log:</b>
                    <pre style={{ margin: 0, fontFamily: 'inherit', background: 'none', whiteSpace: 'pre-wrap' }}>{r.errorMessage}</pre>
                  </Box>
                  
                  {/* Screenshots */}
                  {r.screenshots && r.screenshots.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                        <ImageIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Screenshots ({r.screenshots.length}):
                      </Typography>
                      <ImageList sx={{ width: '100%', maxHeight: 600 }} cols={r.screenshots.length === 1 ? 1 : 2} gap={8}>
                        {r.screenshots.map((screenshot, idx) => {
                          // Handle both old base64 format and new URL format
                          let imageUrl = null;
                          if (screenshot.data) {
                            // Base64 encoded image (old format)
                            imageUrl = screenshot.data;
                          } else if (screenshot.url) {
                            // URL from backend - prepend API base URL if relative
                            imageUrl = screenshot.url.startsWith('/') ? `${API_BASE_URL}${screenshot.url}` : screenshot.url;
                          } else if (screenshot.filename) {
                            // Construct URL from filename
                            imageUrl = `${API_BASE_URL}/uploads/screenshots/${screenshot.filename}`;
                          }
                          
                          if (!imageUrl) return null;
                          
                          return (
                            <ImageListItem key={idx} sx={{ border: '2px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                              <img
                                src={imageUrl}
                                alt={`Screenshot ${idx + 1}`}
                                loading="lazy"
                                style={{ cursor: 'pointer', objectFit: 'contain', maxHeight: '400px' }}
                                onClick={(e) => window.open(e.target.src, '_blank')}
                                title="Click to open in new tab"
                              />
                              <Box sx={{ textAlign: 'center', fontSize: 11, color: '#666', p: 0.5, background: '#f5f5f5' }}>
                                {screenshot.name || screenshot.filename || `Screenshot ${idx + 1}`}
                              </Box>
                            </ImageListItem>
                          );
                        })}
                      </ImageList>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666', fontStyle: 'italic' }}>
                        💡 Click on any screenshot to view in full size
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Test Execution
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this entire test execution ({runId})? 
            <br /><br />
            This will permanently remove all {results.length} test results from the database.
            <br /><br />
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
