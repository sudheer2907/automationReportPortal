const axios = require('axios');
const path = require('path');

function stripAnsi(str) {
  return typeof str === 'string' ? str.replace(/[\u001b\u009b][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '') : str;
}

function formatDetailedError(error) {
  let msg = error.message || '';
  if (error.expected !== undefined && error.actual !== undefined) {
    msg += `\nExpected: ${JSON.stringify(error.expected, null, 2)}\nReceived: ${JSON.stringify(error.actual, null, 2)}`;
  }
  if (error.stack) {
    msg += `\nStack Trace:\n${error.stack}`;
  }
  if (error.locator) {
    msg += `\nLocator: ${error.locator}`;
  }
  if (error.callLog) {
    msg += `\nCall log:\n${error.callLog}`;
  }
  return stripAnsi(msg.trim());
}

class RunIdReporter {
  constructor() {
    this.run_id = Date.now().toString();
    this.results = [];
    this.htmlReportPath = path.resolve(process.cwd(), 'playwright-report', 'index.html');
  }

  onTestEnd(test, result) {
    this.results.push({
      framework: 'playwright',
      suite: test.parent ? test.parent.title : '',
      testName: test.title,
      status: result.status,
      duration: result.duration,
      errorMessage: result.status === 'failed' && result.error ? formatDetailedError(result.error) : null,
      run_id: this.run_id,
      timestamp: new Date().toISOString(),
      htmlReportPath: this.htmlReportPath
    });
  }

  async onEnd() {
    try {
      for (const res of this.results) {
        await axios.post('http://localhost:5000/api/results', res);
      }
      console.log('Test results submitted with run_id:', this.run_id);
      console.log('HTML report path:', this.htmlReportPath);
    } catch (err) {
      console.error('Failed to submit test results:', err.message);
    }
  }
}

module.exports = RunIdReporter;