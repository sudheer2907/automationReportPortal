const TestResult = require('../models/TestResult');
const { Op } = require('sequelize');
const uploadController = require('./uploadController');

// Expects run_id to be provided in req.body for each test suite run
exports.submitResult = async (req, res) => {
  try {
    if (!req.body.run_id) {
      return res.status(400).json({ message: 'run_id is required' });
    }
    // Accept htmlReportPath and screenshots in the request body
    const result = await TestResult.create({
      ...req.body,
      htmlReportPath: req.body.htmlReportPath || null,
      screenshots: req.body.screenshots || null
    });
    // After saving, keep only the last 30 unique run_id per project (framework)
    if (result.framework) {
      // Find the 30 most recent run_ids by their latest createdAt (table name is TestResults)
      const [rows] = await TestResult.sequelize.query(`
        SELECT run_id FROM (
          SELECT run_id, MAX(createdAt) as maxCreatedAt
          FROM TestResults
          WHERE framework = :framework
          GROUP BY run_id
        ) as grouped
        ORDER BY maxCreatedAt DESC
        LIMIT 30
      `, {
        replacements: { framework: result.framework },
      });
      const keepRunIds = rows.map(r => r.run_id);
      // Delete all test cases for run_ids not in the 30 most recent
      await TestResult.destroy({
        where: {
          framework: result.framework,
          run_id: { [Op.notIn]: keepRunIds }
        }
      });
      
      // Also cleanup old screenshot files
      await uploadController.cleanupOldScreenshots(result.framework);
    }
    res.status(201).json({ message: 'Test result saved', id: result.id, htmlReportPath: result.htmlReportPath });
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await TestResult.findAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteByRunId = async (req, res) => {
  try {
    const { run_id } = req.params;
    if (!run_id) {
      return res.status(400).json({ message: 'run_id is required' });
    }
    const deletedCount = await TestResult.destroy({
      where: { run_id }
    });
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'No test results found with this run_id' });
    }
    res.json({ message: `Deleted ${deletedCount} test result(s) for run_id: ${run_id}`, deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

