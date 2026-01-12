
import { SalesBatch, RateLadderItem } from '../types';

export const calculateAverageWeight = (totalKg: number, totalPieces: number) => {
  if (totalPieces === 0) return 0;
  return totalKg / totalPieces;
};

export const calculateFeedConsumed = (batch: SalesBatch) => {
  return batch.dailyEntries.reduce((acc, curr) => acc + curr.feedSacks, 0);
};

export const calculateFeedPoints = (totalWeightKg: number, totalFeedSacks: number) => {
  if (totalFeedSacks === 0) return 0;
  return totalWeightKg / totalFeedSacks;
};

export const getRateFromPoints = (points: number, ladder: RateLadderItem[]) => {
  const sorted = [...ladder].sort((a, b) => b.minPoints - a.minPoints);
  for (const item of sorted) {
    if (points >= item.minPoints) return item.rate;
  }
  return sorted[sorted.length - 1]?.rate || 0;
};

export const calculateMortalityCost = (batch: SalesBatch) => {
  const totalDead = batch.dailyEntries.reduce((acc, curr) => acc + curr.mortality, 0);
  const freeLimit = Math.floor(batch.chickCount * 0.04); // 4% free
  const chargeableDead = Math.max(0, totalDead - freeLimit);
  return {
    totalDead,
    freeLimit,
    chargeableDead,
    cost: chargeableDead * batch.chickRate
  };
};

export const calculateFarmerProfit = (
  batch: SalesBatch, 
  totalKgSold: number, 
  points: number, 
  ladder: RateLadderItem[]
) => {
  const ratePerKg = getRateFromPoints(points, ladder);
  const grossIncome = totalKgSold * ratePerKg;
  
  const mortality = calculateMortalityCost(batch);
  const appliedMortalityCost = batch.applyMortalityCharge ? mortality.cost : 0;
  
  const stockValue = batch.stockKg * batch.stockRate;
  const deductions = batch.manualDeductions.reduce((acc, d) => acc + d.amount, 0);
  
  const netProfit = grossIncome - appliedMortalityCost - deductions;
  
  return {
    grossIncome,
    ratePerKg,
    mortalityTotal: mortality.totalDead,
    mortalityFree: mortality.freeLimit,
    mortalityChargeable: mortality.chargeableDead,
    mortalityCost: appliedMortalityCost,
    stockValue,
    deductions,
    netProfit
  };
};

export const calculateDealerProfit = (
  batch: SalesBatch,
  totalKgSold: number,
  farmerProfit: number
) => {
  const feedConsumed = calculateFeedConsumed(batch);
  const totalCost = (batch.chickCount * batch.chickRate) + 
                    (feedConsumed * batch.feedCostPerSack) + 
                    batch.medicineCost + 
                    farmerProfit;
  
  const revenue = totalKgSold * batch.marketRate;
  return revenue - totalCost;
};
