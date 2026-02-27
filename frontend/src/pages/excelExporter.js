import * as XLSX from 'xlsx';

/**
 * Generate and download Excel report of test results
 * @param {Array} results - Array of test result objects
 * @param {string} runId - Test run identifier
 * @param {string} project - Project/framework name
 */
export const downloadTestResultsAsExcel = (results, runId, project) => {
  if (!results || results.length === 0) {
    alert('No test results to export');
    return;
  }

  // Separate passed and failed tests
  const passedTests = results.filter(r => r.status === 'passed');
  const failedTests = results.filter(r => r.status === 'failed');
  const skippedTests = results.filter(r => r.status === 'skipped');

  // Create workbook with multiple sheets
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Test Execution Summary'],
    [],
    ['Run ID', runId],
    ['Project', project],
    ['Execution Date', new Date().toLocaleString()],
    [],
    ['Total Tests', results.length],
    ['Passed', passedTests.length],
    ['Failed', failedTests.length],
    ['Skipped', skippedTests.length],
    ['Pass Rate %', ((passedTests.length / results.length) * 100).toFixed(2)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Passed Tests
  if (passedTests.length > 0) {
    const passedData = [
      ['Test Name', 'Suite', 'Duration (ms)', 'Timestamp']
    ];
    passedTests.forEach(test => {
      passedData.push([
        test.testName || 'N/A',
        test.suite || 'N/A',
        test.duration || 'N/A',
        test.timestamp ? new Date(test.timestamp).toLocaleString() : 'N/A'
      ]);
    });
    const passedSheet = XLSX.utils.aoa_to_sheet(passedData);
    passedSheet['!cols'] = [{ wch: 40 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, passedSheet, 'Passed Tests');
  }

  // Sheet 3: Failed Tests
  if (failedTests.length > 0) {
    const failedData = [
      ['Test Name', 'Suite', 'Duration (ms)', 'Error Message', 'Timestamp']
    ];
    failedTests.forEach(test => {
      failedData.push([
        test.testName || 'N/A',
        test.suite || 'N/A',
        test.duration || 'N/A',
        test.errorMessage ? test.errorMessage.substring(0, 200) : 'N/A', // Limit error message length
        test.timestamp ? new Date(test.timestamp).toLocaleString() : 'N/A'
      ]);
    });
    const failedSheet = XLSX.utils.aoa_to_sheet(failedData);
    failedSheet['!cols'] = [{ wch: 40 }, { wch: 30 }, { wch: 15 }, { wch: 50 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, failedSheet, 'Failed Tests');
  }

  // Sheet 4: Skipped Tests
  if (skippedTests.length > 0) {
    const skippedData = [
      ['Test Name', 'Suite', 'Timestamp']
    ];
    skippedTests.forEach(test => {
      skippedData.push([
        test.testName || 'N/A',
        test.suite || 'N/A',
        test.timestamp ? new Date(test.timestamp).toLocaleString() : 'N/A'
      ]);
    });
    const skippedSheet = XLSX.utils.aoa_to_sheet(skippedData);
    skippedSheet['!cols'] = [{ wch: 40 }, { wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, skippedSheet, 'Skipped Tests');
  }

  // Sheet 5: All Tests
  const allData = [
    ['Test Name', 'Suite', 'Status', 'Duration (ms)', 'Error Message', 'Timestamp']
  ];
  results.forEach(test => {
    allData.push([
      test.testName || 'N/A',
      test.suite || 'N/A',
      test.status || 'N/A',
      test.duration || 'N/A',
      test.errorMessage ? test.errorMessage.substring(0, 200) : '',
      test.timestamp ? new Date(test.timestamp).toLocaleString() : 'N/A'
    ]);
  });
  const allSheet = XLSX.utils.aoa_to_sheet(allData);
  allSheet['!cols'] = [{ wch: 40 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 50 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, allSheet, 'All Tests');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `TestResults_${project}_${timestamp}.xlsx`;

  // Write the file
  XLSX.writeFile(workbook, filename);
};
