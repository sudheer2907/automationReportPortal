import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, FormControl, InputLabel, Select, MenuItem, TablePagination } from '@mui/material';
import TrendChart from './TrendChart';
import { Link as RouterLink } from 'react-router-dom';
// For Pass/Fail Trend: show each run's pass/fail count as a separate bar, grouped by date or week
function getPassFailTrend(results, mode) {
  // Group runs by date or week
  const groupMap = {};
  results.forEach(r => {
    let runLabel = r.run_id;
    let dateObj = null;
    if (/^\d{13,}$/.test(runLabel)) {
      dateObj = new Date(Number(runLabel));
    }
    let dateKey = dateObj ? dateObj.toLocaleDateString('en-GB') : runLabel;
    let weekKey = dateObj ? getWeekLabel(dateObj) : runLabel;
    let groupKey = (mode === 'weekly' && weekKey) ? weekKey : dateKey;
    if (!groupMap[groupKey]) groupMap[groupKey] = [];
    // Find or create run entry for this run_id
    let runEntry = groupMap[groupKey].find(e => e.run_id === runLabel);
    if (!runEntry) {
      runEntry = { run_id: runLabel, label: groupKey, passed: 0, failed: 0, skipped: 0 };
      groupMap[groupKey].push(runEntry);
    }
    if (r.status === 'passed') runEntry.passed += 1;
    if (r.status === 'failed') runEntry.failed += 1;
    if (r.status === 'skipped') runEntry.skipped += 1;
  });
  // Flatten to array, sort by group label (date/week) and then by run_id
  return Object.values(groupMap)
    .flat()
    .sort((a, b) => {
      const aDate = new Date(a.label.split(' ')[0].split('-').reverse().join('-'));
      const bDate = new Date(b.label.split(' ')[0].split('-').reverse().join('-'));
      if (aDate - bDate !== 0) return aDate - bDate;
      return a.run_id.localeCompare(b.run_id);
    });
}




// Original grouping for table (by run_id and project)
const groupResultsByRunId = (results) => {
  const grouped = {};
  results.forEach(r => {
    let runLabel = r.run_id;
    let dateStr = runLabel;
    if (/^\d{13,}$/.test(runLabel)) {
      const date = new Date(Number(runLabel));
      dateStr = date.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-').replace(',', '');
    }
    const project = r.framework || 'Unknown';
    const key = `${runLabel}__${project}`;
    if (!grouped[key]) grouped[key] = { date: dateStr, project, passed: 0, failed: 0, skipped: 0, executionTime: r.executionTime || 'N/A' };
    if (r.status === 'passed') grouped[key].passed += 1;
    if (r.status === 'failed') grouped[key].failed += 1;
    if (r.status === 'skipped') grouped[key].skipped += 1;
  });
  // Sort by run_id in descending order (latest first)
  return Object.entries(grouped)
    .sort((a, b) => {
      const runIdA = a[0].split('__')[0];
      const runIdB = b[0].split('__')[0];
      // If run_id is a timestamp, compare numerically
      if (/^\d{13,}$/.test(runIdA) && /^\d{13,}$/.test(runIdB)) {
        return Number(runIdB) - Number(runIdA);
      }
      // Otherwise compare as strings
      return runIdB.localeCompare(runIdA);
    })
    .map(([_, value]) => value);
};

// Helper to get week label (Monday to Friday)
function getWeekLabel(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return `${monday.toLocaleDateString('en-GB')} - ${friday.toLocaleDateString('en-GB')}`;
}

// For Automation Count Trend: get max test count per day or per week (Friday)
function getAutomationCountTrend(results, mode) {
  // Group by run_id and get test count per run_id per day
  const runIdMap = {};
  results.forEach(r => {
    let runLabel = r.run_id;
    let dateObj = null;
    if (/^\d{13,}$/.test(runLabel)) {
      dateObj = new Date(Number(runLabel));
    }
    let dateKey = dateObj ? dateObj.toLocaleDateString('en-GB') : runLabel;
    let weekKey = dateObj ? getWeekLabel(dateObj) : runLabel;
    if (!runIdMap[runLabel]) runIdMap[runLabel] = { dateObj, dateKey, weekKey, count: 0 };
    runIdMap[runLabel].count += 1;
  });

  // For each day or week, find the run_id with max count
  const groupMap = {};
  Object.values(runIdMap).forEach(({ dateObj, dateKey, weekKey, count }) => {
    if (mode === 'weekly' && weekKey) {
      if (!groupMap[weekKey] || count > groupMap[weekKey].count) {
        groupMap[weekKey] = { label: weekKey, count };
      }
    } else if (dateKey) {
      if (!groupMap[dateKey] || count > groupMap[dateKey].count) {
        groupMap[dateKey] = { label: dateKey, count };
      }
    }
  });
  // Sort by date ascending
  return Object.values(groupMap).sort((a, b) => {
    // Try to parse as date, fallback to string
    const aDate = new Date(a.label.split(' ')[0].split('-').reverse().join('-'));
    const bDate = new Date(b.label.split(' ')[0].split('-').reverse().join('-'));
    return aDate - bDate;
  });
}


export default function Dashboard({ role }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('All');
  const [trendMode, setTrendMode] = useState('date'); // 'date' or 'weekly'

  const { protocol, hostname } = window.location;
  const API_BASE_URL = `${protocol}//${hostname}:5000`;

  const fetchResults = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/results`)
      .then(res => {
        setResults(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Get unique project names
  const projectNames = Array.from(new Set(results.map(r => r.framework || 'Unknown')));
  const filteredResults = selectedProject === 'All' ? results : results.filter(r => (r.framework || 'Unknown') === selectedProject);
  const groupedTrendResults = getAutomationCountTrend(filteredResults, trendMode === 'weekly' ? 'weekly' : 'date');
  const groupedPassFailResults = getPassFailTrend(filteredResults, trendMode === 'weekly' ? 'weekly' : 'date');
  const groupedResults = groupResultsByRunId(filteredResults);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <div>Loading...</div>;
  return (
    <Container maxWidth="lg" sx={{
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f4f6fa 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="trend-mode-label">Trend Mode</InputLabel>
          <Select
            labelId="trend-mode-label"
            value={trendMode}
            label="Trend Mode"
            onChange={e => setTrendMode(e.target.value)}
          >
            <MenuItem value="date">Date Wise</MenuItem>
            <MenuItem value="weekly">Weekly Wise</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="project-filter-label">Select Project</InputLabel>
          <Select
            labelId="project-filter-label"
            value={selectedProject}
            label="Select Team"
            onChange={e => setSelectedProject(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {projectNames.map((name, idx) => (
              <MenuItem key={idx} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" sx={{ height: 40 }} onClick={fetchResults}>Refresh</Button>
      </div>
      <TrendChart groupedResults={groupedTrendResults} trendMode={trendMode} chartType="automationCount" />
      <TrendChart groupedResults={groupedPassFailResults} trendMode={trendMode} chartType="passFail" />
      <Paper elevation={3} sx={{ p: 6, mt: 8 }}>
        {/* <Typography variant="h6" align="left" gutterBottom>Date Wise Test Results</Typography> */}
        <Typography variant="h6" align="left" gutterBottom sx={{ fontSize: '1rem' }}>Date Wise Execution Details</Typography>
        {/* Project dropdown and refresh button moved above for improved layout */}
        <Typography variant="body2" sx={{ mb: 2, color: 'gray' }}>Showing last 30 Executions Records</Typography>
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Project Name</TableCell>
                <TableCell>Pass</TableCell>
                <TableCell>Fail</TableCell>
                <TableCell>Skipped</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Pass %</TableCell>
                <TableCell>Execution Time</TableCell>
                <TableCell>Reports</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => {
                const total = row.passed + row.failed + row.skipped;
                const passPercent = total > 0 ? ((row.passed / total) * 100).toFixed(1) : '0.0';
                return (
                  <TableRow key={idx} sx={{ height: 28 }}>
                    <TableCell sx={{ py: 0.5 }}>{row.date}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.project}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.passed}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.failed}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.skipped}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{total}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{passPercent}%</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.executionTime}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Button variant="outlined" size="small" component={RouterLink} to={`/testrun/${encodeURIComponent(row.date)}/${encodeURIComponent(row.project)}`}>View Details</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            component="div"
            count={groupedResults.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>
    </Container>
  );
}

