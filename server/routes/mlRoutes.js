const express = require('express');
const { predictPricePreview } = require('../controllers/mlController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/predict-price', protect, predictPricePreview);

module.exports = router;
