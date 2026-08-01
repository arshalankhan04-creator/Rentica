const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';
const ML_TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS || 8000);

class MLServiceError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'MLServiceError';
    this.status = options.status;
    this.cause = options.cause;
  }
}

const withTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new MLServiceError(`ML service timed out after ${ML_TIMEOUT_MS}ms`, { cause: error });
    }
    throw new MLServiceError('ML service is unavailable', { cause: error });
  } finally {
    clearTimeout(timeout);
  }
};

const normalizeVehiclePayload = (vehicle) => ({
  brand: vehicle.brand,
  model: vehicle.model,
  year: Number(vehicle.year),
  kmDriven: Number(vehicle.kmDriven),
  fuelType: vehicle.fuelType,
  transmission: vehicle.transmission
});

const postToML = async (path, payload) => {
  const response = await withTimeout(`${ML_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    throw new MLServiceError('ML service returned an invalid JSON response', {
      status: response.status,
      cause: error
    });
  }

  if (!response.ok) {
    const detail = body?.detail || body?.message || 'ML request failed';
    throw new MLServiceError(detail, { status: response.status });
  }

  return body;
};

const predictPrice = async (vehicle) => {
  const payload = normalizeVehiclePayload(vehicle);
  return postToML('/api/ml/predict-price/', payload);
};

const calculatePriceFairness = (askingPrice, prediction) => {
  const price = Number(askingPrice);
  const min = Number(prediction.predicted_price_min);
  const max = Number(prediction.predicted_price_max);
  const predicted = Number(prediction.predicted_price);

  if (!price || !min || !max || !predicted) {
    return {
      riskFlag: null,
      fraudProbability: null,
      trustScore: null,
      trustBreakdown: null
    };
  }

  const distance = Math.abs(price - predicted) / predicted;
  const belowRange = price < min;
  const aboveRange = price > max;

  let fraudProbability = Math.min(0.95, Math.max(0.02, distance));
  if (belowRange && price < min * 0.75) fraudProbability = Math.max(fraudProbability, 0.75);
  if (aboveRange && price > max * 1.35) fraudProbability = Math.max(fraudProbability, 0.55);

  let riskFlag = 'Low';
  if (fraudProbability >= 0.7) riskFlag = 'High';
  else if (fraudProbability >= 0.35) riskFlag = 'Medium';

  const priceFairnessScore = Math.max(0, Math.round(100 - distance * 100));
  const fraudRiskScore = Math.round((1 - fraudProbability) * 100);
  const trustScore = Math.round(priceFairnessScore * 0.6 + fraudRiskScore * 0.4);

  return {
    riskFlag,
    fraudProbability: Number(fraudProbability.toFixed(2)),
    trustScore,
    trustBreakdown: {
      price_fairness: priceFairnessScore,
      fraud_risk: fraudRiskScore,
      asking_price: price,
      predicted_price: predicted,
      predicted_price_min: min,
      predicted_price_max: max
    }
  };
};

const analyzeListing = async (vehicle) => {
  const prediction = await predictPrice(vehicle);
  const risk = calculatePriceFairness(vehicle.price, prediction);

  return {
    predictedPriceMin: prediction.predicted_price_min,
    predictedPriceMax: prediction.predicted_price_max,
    confidenceLevel: prediction.confidence_level,
    featureImportance: prediction.feature_importance,
    ...risk
  };
};

module.exports = {
  MLServiceError,
  analyzeListing,
  predictPrice
};
