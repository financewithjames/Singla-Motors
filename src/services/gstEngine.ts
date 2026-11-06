export interface GSTCalculationResult {
  taxableValue: number;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGstAmount: number;
  totalAmount: number;
}

export function calculateGSTFromInclusivePrice(
  inclusivePrice: number,
  gstRate: number,
  isInterState: boolean
): GSTCalculationResult {
  // Taxable Value = Inclusive Price / (1 + Rate / 100)
  const taxableValue = Math.round((inclusivePrice / (1 + gstRate / 100)) * 100) / 100;
  const totalGstAmount = Math.round((inclusivePrice - taxableValue) * 100) / 100;

  if (isInterState) {
    return {
      taxableValue,
      gstRate,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: totalGstAmount,
      totalGstAmount,
      totalAmount: inclusivePrice,
    };
  }

  const halfRate = gstRate / 2;
  const halfGst = Math.round((totalGstAmount / 2) * 100) / 100;

  return {
    taxableValue,
    gstRate,
    cgstRate: halfRate,
    sgstRate: halfRate,
    igstRate: 0,
    cgstAmount: halfGst,
    sgstAmount: halfGst,
    igstAmount: 0,
    totalGstAmount,
    totalAmount: inclusivePrice,
  };
}

export function calculateGSTFromBasePrice(
  basePrice: number,
  gstRate: number,
  isInterState: boolean
): GSTCalculationResult {
  const totalGstAmount = Math.round(((basePrice * gstRate) / 100) * 100) / 100;
  const totalAmount = Math.round((basePrice + totalGstAmount) * 100) / 100;

  if (isInterState) {
    return {
      taxableValue: basePrice,
      gstRate,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: totalGstAmount,
      totalGstAmount,
      totalAmount,
    };
  }

  const halfRate = gstRate / 2;
  const halfGst = Math.round((totalGstAmount / 2) * 100) / 100;

  return {
    taxableValue: basePrice,
    gstRate,
    cgstRate: halfRate,
    sgstRate: halfRate,
    igstRate: 0,
    cgstAmount: halfGst,
    sgstAmount: halfGst,
    igstAmount: 0,
    totalGstAmount,
    totalAmount,
  };
}
