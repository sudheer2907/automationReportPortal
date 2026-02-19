import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, List, ListItem, ListItemText, Button, Collapse, Divider, ImageList, ImageListItem } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ImageIcon from '@mui/icons-material/Image';

export default function TestRunDetails() {
  const { runId, project } = useParams();
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState({});

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

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        <Typography variant="h5" gutterBottom>Test Run Details</Typography>
        <Typography variant="subtitle1" gutterBottom>Project: {project || 'Unknown'} | Run ID: {runId}</Typography>
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
    </Container>
  );
}
