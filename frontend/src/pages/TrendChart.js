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
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

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
        },
        datalabels: {
          display: true,
          color: '#fff',
          anchor: 'center',
          align: 'center',
          font: {
            weight: 'bold',
            size: 16
          },
          formatter: function(value) {
            return value;
          },
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderRadius: 4,
          padding: 6
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
      labels: sorted.map(r => {
        // If run_id is a timestamp, format as IST date/time
        let formattedLabel = r.label;
        if (/^\d{13,}$/.test(r.run_id)) {
          const date = new Date(Number(r.run_id));
          // Format as IST (India Standard Time)
          const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
          formattedLabel = istDate.toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' });
        }
        return formattedLabel;
      }),
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
