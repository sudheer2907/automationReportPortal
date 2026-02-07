const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

class RunIdReporter {
  constructor() {
    this.run_id = uuidv4();
    this.results = [];
  }

  onTestEnd(test, result) {
    this.results.push({
      framework: 'playwright',
      suite: test.parent ? test.parent.title : '',
      testName: test.title,
      status: result.status,
      duration: result.duration,
      errorMessage: result.error ? require('./strip-ansi')(result.error.message) : null,
      run_id: this.run_id,
      timestamp: new Date().toISOString(),
    });
  }

  async onEnd() {
    try {
      for (const res of this.results) {
        await axios.post('http://localhost:5000/api/results', res);
      }
      console.log('Test results submitted with run_id:', this.run_id);
    } catch (err) {
      console.error('Failed to submit test results:', err.message);
    }
  }
}

module.exports = RunIdReporter;
