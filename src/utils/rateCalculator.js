/**
 * Utility functions for calculating optimal rates based on target margins
 * and flagging rates that may be too high
 */

/**
 * Calculate the optimal base rate to achieve a target margin
 * 
 * Cost model:
 * - Revenue = baseRate * distance
 * - Linehaul Cost = estimated as 75% of revenue (industry standard)
 * - Fuel Cost = fuelSurcharge * distance
 * - Accessorials = fixed value
 * - Deadhead Cost = deadhead * 1.5
 * - Total Cost = Linehaul Cost + Fuel + Accessorials + Deadhead
 * - Margin = (Revenue - Total Cost) / Total Cost * 100
 * 
 * Solving for baseRate given target margin:
 * Let R = revenue = baseRate * distance
 * Let C = other costs = fuel + accessorials + deadhead
 * Total Cost = 0.75R + C
 * Margin M = (R - (0.75R + C)) / (0.75R + C) * 100
 * 
 * Solving: R = C(100 + M) / (25 - 0.75M)
 * baseRate = R / distance
 * 
 * @param {Object} lane - Lane object with distance, fuelSurcharge, accessorials, deadhead
 * @param {number} targetMargin - Target margin percentage (e.g., 12 for 12%)
 * @returns {number} - Optimal base rate per mile
 */
export function calculateOptimalRate(lane, targetMargin) {
  const distance = lane.distance || 0;
  const fuelSurcharge = parseFloat(lane.fuelSurcharge) || 0;
  const accessorials = parseFloat(lane.accessorials) || 0;
  const deadhead = lane.deadhead || 0;
  
  if (distance === 0) {
    return parseFloat(lane.baseRate) || 0;
  }
  
  // Other costs (non-linehaul)
  const otherCosts = (fuelSurcharge * distance) + accessorials + (deadhead * 1.5);
  
  // Calculate required revenue
  // R = C(100 + M) / (25 - 0.75M)
  const denominator = 25 - (0.75 * targetMargin);
  
  if (denominator <= 0) {
    // Invalid margin target (would require negative revenue)
    return parseFloat(lane.baseRate) || 0;
  }
  
  const requiredRevenue = (otherCosts * (100 + targetMargin)) / denominator;
  const optimalRate = requiredRevenue / distance;
  
  return Math.max(0, optimalRate); // Ensure non-negative
}

/**
 * Calculate current margin for a lane
 * @param {Object} lane - Lane object
 * @returns {number} - Current margin percentage
 */
export function calculateCurrentMargin(lane) {
  const distance = lane.distance || 0;
  const baseRate = parseFloat(lane.baseRate) || 0;
  const fuelSurcharge = parseFloat(lane.fuelSurcharge) || 0;
  const accessorials = parseFloat(lane.accessorials) || 0;
  const deadhead = lane.deadhead || 0;
  
  if (distance === 0) {
    return 0;
  }
  
  const revenue = baseRate * distance;
  const estimatedLinehaulCost = revenue * 0.75;
  const fuel = fuelSurcharge * distance;
  const deadheadCost = deadhead * 1.5;
  const totalCost = estimatedLinehaulCost + fuel + accessorials + deadheadCost;
  
  if (totalCost === 0) {
    return 0;
  }
  
  return ((revenue - totalCost) / totalCost) * 100;
}

/**
 * Check if a rate is too high compared to benchmarks
 * @param {Object} lane - Lane object with baseRate and benchmark
 * @param {number} thresholdPercent - Percentage above benchmark to flag (default 20%)
 * @returns {Object} - { isTooHigh: boolean, reason: string, percentAbove: number }
 */
export function checkRateTooHigh(lane, thresholdPercent = 20) {
  const baseRate = parseFloat(lane.baseRate) || 0;
  const benchmark = parseFloat(lane.benchmark) || 0;
  const historicalRate = parseFloat(lane.historicalRate) || 0;
  
  const results = {
    isTooHigh: false,
    reason: null,
    percentAbove: 0,
    comparedTo: null
  };
  
  // Compare to benchmark if available
  if (benchmark > 0) {
    const percentAbove = ((baseRate - benchmark) / benchmark) * 100;
    if (percentAbove > thresholdPercent) {
      results.isTooHigh = true;
      results.reason = `Rate is ${percentAbove.toFixed(1)}% above market benchmark`;
      results.percentAbove = percentAbove;
      results.comparedTo = 'benchmark';
      return results;
    }
  }
  
  // Compare to historical rate if available
  if (historicalRate > 0) {
    const percentAbove = ((baseRate - historicalRate) / historicalRate) * 100;
    if (percentAbove > thresholdPercent) {
      results.isTooHigh = true;
      results.reason = `Rate is ${percentAbove.toFixed(1)}% above historical rate`;
      results.percentAbove = percentAbove;
      results.comparedTo = 'historical';
      return results;
    }
  }
  
  return results;
}

/**
 * Pre-solve rates for all lanes to achieve target margin
 * @param {Array} lanes - Array of lane objects
 * @param {number} targetMargin - Target margin percentage
 * @param {Object} options - Options for rate solving
 * @returns {Array} - Array of lane updates with optimal rates and flags
 */
export function preSolveRates(lanes, targetMargin, options = {}) {
  const {
    flagHighRates = true,
    highRateThreshold = 20,
    minRate = 0,
    maxRate = null
  } = options;
  
  return lanes.map(lane => {
    const optimalRate = calculateOptimalRate(lane, targetMargin);
    
    // Apply min/max constraints
    let finalRate = Math.max(minRate, optimalRate);
    if (maxRate !== null) {
      finalRate = Math.min(maxRate, finalRate);
    }
    
    // Recalculate margin with final rate
    const updatedLane = {
      ...lane,
      baseRate: finalRate.toFixed(2)
    };
    const newMargin = calculateCurrentMargin(updatedLane);
    
    // Check if rate is too high
    const rateCheck = flagHighRates ? checkRateTooHigh(updatedLane, highRateThreshold) : { isTooHigh: false };
    
    return {
      laneId: lane.id,
      originalRate: parseFloat(lane.baseRate),
      optimalRate: finalRate,
      newRate: finalRate.toFixed(2),
      newMargin: newMargin.toFixed(1),
      targetMargin,
      rateTooHigh: rateCheck.isTooHigh,
      rateWarning: rateCheck.reason,
      percentAbove: rateCheck.percentAbove
    };
  });
}



