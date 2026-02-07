import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, List, ListItem, ListItemText, Button, Collapse, Divider } from '@mui/material';

export default function TestRunDetails() {
  const { runId, project } = useParams();
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/api/results`)
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
                <ListItemText primary={r.testName} secondary={r.suite} />
              </ListItem>
              <Collapse in={!!expanded[i]} timeout="auto" unmountOnExit>
                <Box sx={{ color: 'red', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13, background: '#fff0f0', borderRadius: 1, p: 2, border: '1px solid #f44336', mt: 1 }}>
                  <b>Failure Log:</b>
                  <pre style={{ margin: 0, fontFamily: 'inherit', background: 'none', whiteSpace: 'pre-wrap' }}>{r.errorMessage}</pre>
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
