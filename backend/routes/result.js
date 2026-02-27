const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.post('/', resultController.submitResult);
router.get('/', resultController.getResults);
router.delete('/run/:run_id', auth('admin'), resultController.deleteByRunId);
router.post('/upload-screenshots', uploadController.uploadScreenshots, uploadController.handleUpload);

module.exports = router;
