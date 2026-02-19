const axios = require('axios');
const path = require('path');
const fs = require('fs');

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
    this.startTime = null;
  }

  normalizeStatus(status) {
    if (status === 'timedOut') return 'failed';
    if (status === 'interrupted') return 'skipped';
    return status;
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
  }

  formatExecutionTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      const remainingSeconds = seconds % 60;
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  onTestEnd(test, result) {
    // Extract screenshots from attachments - store paths only
    const screenshots = [];
    if (result.attachments && result.attachments.length > 0) {
      for (const attachment of result.attachments) {
        if (attachment.name === 'screenshot' || attachment.contentType?.startsWith('image/')) {
          try {
            if (attachment.path && fs.existsSync(attachment.path)) {
              screenshots.push(attachment.path);
            }
          } catch (err) {
            console.warn('Failed to process screenshot:', err.message);
          }
        }
      }
    }

    this.results.push({
      framework: 'qa-playwright',
      suite: test.parent ? test.parent.title : '',
      testName: test.title,
      status: this.normalizeStatus(result.status),
      duration: result.duration,
      errorMessage: result.status === 'failed' && result.error ? formatDetailedError(result.error) : null,
      run_id: this.run_id,
      timestamp: new Date().toISOString(),
      htmlReportPath: this.htmlReportPath,
      screenshotPaths: screenshots.length > 0 ? screenshots : null
    });
  }

  async onEnd() {
    const endTime = Date.now();
    const totalDuration = this.startTime ? endTime - this.startTime : 0;
    const executionTime = this.formatExecutionTime(totalDuration);
    const FormData = require('form-data');
    
    try {
      for (const res of this.results) {
        let screenshotUrls = null;
        
        // Upload screenshots if present
        if (res.screenshotPaths && res.screenshotPaths.length > 0) {
          try {
            const formData = new FormData();
            formData.append('run_id', this.run_id);
            formData.append('testName', res.testName);
            
            for (const screenshotPath of res.screenshotPaths) {
              if (fs.existsSync(screenshotPath)) {
                formData.append('screenshots', fs.createReadStream(screenshotPath), {
                  filename: path.basename(screenshotPath)
                });
              }
            }
            
            const uploadResponse = await axios.post('http://localhost:5000/api/results/upload-screenshots', formData, {
              headers: formData.getHeaders(),
              maxContentLength: Infinity,
              maxBodyLength: Infinity
            });
            
            screenshotUrls = uploadResponse.data.files;
          } catch (uploadErr) {
            console.warn('Failed to upload screenshots:', uploadErr.message);
          }
        }
        
        // Submit test result with screenshot URLs
        await axios.post('http://localhost:5000/api/results', {
          framework: res.framework,
          suite: res.suite,
          testName: res.testName,
          status: res.status,
          duration: res.duration,
          errorMessage: res.errorMessage,
          run_id: res.run_id,
          timestamp: res.timestamp,
          htmlReportPath: res.htmlReportPath,
          executionTime,
          screenshots: screenshotUrls
        });
      }
      console.log('Test results submitted with run_id:', this.run_id);
      console.log('Total execution time:', executionTime);
      console.log('HTML report path:', this.htmlReportPath);
    } catch (err) {
      const responseData = err?.response?.data;
      const responseStatus = err?.response?.status;
      if (responseData || responseStatus) {
        console.error('Failed to submit test results:', responseStatus, responseData);
      } else {
        console.error('Failed to submit test results:', err.message);
      }
    }
  }
}

module.exports = RunIdReporter;