const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const uploadController = require('../controllers/uploadController');

router.post('/', resultController.submitResult);
router.get('/', resultController.getResults);
router.delete('/run/:run_id', resultController.deleteByRunId);
router.post('/upload-screenshots', uploadController.uploadScreenshots, uploadController.handleUpload);

module.exports = router;
