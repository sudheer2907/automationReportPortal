const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/screenshots');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage - organize by run_id
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectory for this run_id
    const runId = req.body.run_id || 'unknown';
    const runDir = path.join(uploadsDir, runId);
    if (!fs.existsSync(runDir)) {
      fs.mkdirSync(runDir, { recursive: true });
    }
    cb(null, runDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const testName = req.body.testName ? req.body.testName.replace(/[^a-z0-9]/gi, '_').substring(0, 50) : 'test';
    cb(null, `${testName}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

exports.uploadScreenshots = upload.array('screenshots', 10);

exports.handleUpload = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const runId = req.body.run_id || 'unknown';
    const fileUrls = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/screenshots/${runId}/${file.filename}`,
      size: file.size
    }));
    
    res.status(200).json({
      message: 'Screenshots uploaded successfully',
      files: fileUrls
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// Cleanup old screenshots - keep only latest 30 run_ids
exports.cleanupOldScreenshots = async (framework) => {
  try {
    const TestResult = require('../models/TestResult');
    
    // Get the 30 most recent run_ids for this framework
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
      replacements: { framework },
    });
    
    const keepRunIds = rows.map(r => r.run_id);
    
    // Get all run_id directories
    const screenshotsBaseDir = path.join(__dirname, '../uploads/screenshots');
    if (fs.existsSync(screenshotsBaseDir)) {
      const allDirs = fs.readdirSync(screenshotsBaseDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      // Delete directories not in keepRunIds
      for (const dirName of allDirs) {
        if (!keepRunIds.includes(dirName)) {
          const dirPath = path.join(screenshotsBaseDir, dirName);
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`Deleted old screenshots for run_id: ${dirName}`);
        }
      }
    }
  } catch (err) {
    console.error('Failed to cleanup old screenshots:', err.message);
  }
};

