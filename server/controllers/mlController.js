const { MLServiceError, predictPrice } = require('../services/mlClient');

const predictPricePreview = async (req, res, next) => {
  try {
    const { brand, model, year, kmDriven, fuelType, transmission } = req.body;

    if (!brand || !model || !year || kmDriven === undefined || !fuelType || !transmission) {
      return res.status(400).json({ message: 'Please provide all required vehicle fields' });
    }

    const prediction = await predictPrice({
      brand,
      model,
      year,
      kmDriven,
      fuelType,
      transmission
    });

    res.json(prediction);
  } catch (error) {
    if (error instanceof MLServiceError) {
      return res.status(error.status || 503).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  predictPricePreview
};
