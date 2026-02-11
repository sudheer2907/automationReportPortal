const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/', resultController.submitResult);
router.get('/', resultController.getResults);
router.delete('/run/:run_id', resultController.deleteByRunId);

module.exports = router;
