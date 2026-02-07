import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TrendChart({ groupedResults, trendMode, chartType }) {
  // Show last 30 groups
  const sorted = [...groupedResults].slice(-30);
  let data, options;
  if (chartType === 'automationCount') {
    data = {
      labels: sorted.map(r => r.label),
      datasets: [
        {
          label: 'Automation Count',
          data: sorted.map(r => r.count),
          backgroundColor: 'rgba(34,197,94,0.7)',
          barThickness: 10
        }
      ]
    };
    options = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text:
            trendMode === 'weekly'
              ? 'Automation Count Trend (Weekly, Mon–Fri, Last 30 Weeks)'
              : 'Automation Count Trend (Daily, Last 30 Days)'
        }
      },
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true }
      }
    };
  } else {
    // Pass/Fail Trend: each run is a separate bar, grouped by date/week
    data = {
      labels: sorted.map(r => `${r.label}\n${r.run_id}`),
      datasets: [
        {
          label: 'Passed',
          data: sorted.map(r => r.passed),
          backgroundColor: 'rgba(34,197,94,0.7)',
          barThickness: 10
        },
        {
          label: 'Failed',
          data: sorted.map(r => r.failed),
          backgroundColor: 'rgba(239,68,68,0.7)',
          barThickness: 10
        }
      ]
    };
    options = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text:
            trendMode === 'weekly'
              ? 'Historical Pass/Fail Trend (Each Run, Weekly, Mon–Fri, Last 30 Runs)' 
              : 'Historical Pass/Fail Trend (Each Run, Daily, Last 30 Runs)'
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    };
  }
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Bar data={data} options={options} height={100} />
    </Paper>
  );
}
