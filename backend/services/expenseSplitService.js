/**
 * Expense Split Service
 * 
 * Contains logic for calculating expense splits based on different split types:
 * - Equal Split: Divides expense equally among all group members
 * - Exact Amount Split: Uses user-specified exact amounts
 * - Percentage Split: Uses user-specified percentages
 */

/**
 * Calculate equal split for an expense
 * 
 * Logic:
 * 1. Divide total amount by number of group members
 * 2. Round each person's share to 2 decimal places
 * 3. Assign remainder to last person to ensure total equals expense amount exactly
 *    (This handles rounding errors - e.g., $100 / 3 = $33.33 each, but 3 * $33.33 = $99.99,
 *     so last person gets $33.34 to make it $100.00)
 * 
 * @param {Number} amount - Total expense amount
 * @param {Array<ObjectId>} memberIds - Array of group member IDs
 * @returns {Array<Object>} Array of split objects with user and amount
 */
function calculateEqualSplit(amount, memberIds) {
  if (!memberIds || memberIds.length === 0) {
    throw new Error('Member IDs array is required and cannot be empty');
  }

  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const numMembers = memberIds.length;
  const perPerson = amount / numMembers;
  const roundedPerPerson = parseFloat(perPerson.toFixed(2));

  // Calculate splits ensuring total equals amount exactly
  const splits = memberIds.map((memberId, index) => {
    // Last person gets the remainder to handle rounding errors
    if (index === numMembers - 1) {
      // Calculate what previous members total to
      const previousTotal = roundedPerPerson * (numMembers - 1);
      // Last person gets the difference to ensure exact total
      const lastAmount = parseFloat((amount - previousTotal).toFixed(2));
      return {
        user: memberId,
        amount: lastAmount
      };
    }
    
    // All other members get the rounded per-person amount
    return {
      user: memberId,
      amount: roundedPerPerson
    };
  });

  return splits;
}

/**
 * Calculate exact amount split for an expense
 * 
 * Logic:
 * 1. Validate that splits array is provided
 * 2. Validate that sum of all split amounts equals total expense amount
 * 3. Round each amount to 2 decimal places
 * 4. Return processed splits
 * 
 * @param {Number} amount - Total expense amount
 * @param {Array<Object>} splits - Array of split objects with user and amount
 * @param {Number} tolerance - Tolerance for amount matching (default: 0.01)
 * @returns {Array<Object>} Array of validated and processed split objects
 * @throws {Error} If validation fails
 */
function calculateExactSplit(amount, splits, tolerance = 0.01) {
  if (!splits || !Array.isArray(splits) || splits.length === 0) {
    throw new Error('Splits array is required and cannot be empty');
  }

  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  // Calculate total of all split amounts
  const totalSplit = splits.reduce((sum, split) => {
    const splitAmount = split.amount || 0;
    if (splitAmount < 0) {
      throw new Error('Split amounts cannot be negative');
    }
    return sum + splitAmount;
  }, 0);

  // Validate that total matches expense amount (within tolerance for floating point errors)
  if (Math.abs(totalSplit - amount) > tolerance) {
    throw new Error(
      `Total split amount (${totalSplit.toFixed(2)}) must equal expense amount (${amount.toFixed(2)})`
    );
  }

  // Process and round each split amount
  const processedSplits = splits.map(split => ({
    user: split.user,
    amount: parseFloat(split.amount.toFixed(2))
  }));

  return processedSplits;
}

/**
 * Calculate percentage split for an expense
 * 
 * Logic:
 * 1. Validate that splits array is provided
 * 2. Validate that sum of all percentages equals 100%
 * 3. Calculate each person's amount: (totalAmount * percentage) / 100
 * 4. Round each amount to 2 decimal places
 * 5. Adjust last person's amount to ensure total equals expense amount exactly
 *    (This handles rounding errors from percentage calculations)
 * 
 * @param {Number} amount - Total expense amount
 * @param {Array<Object>} splits - Array of split objects with user and percentage
 * @param {Number} tolerance - Tolerance for percentage matching (default: 0.01)
 * @returns {Array<Object>} Array of processed split objects with user, amount, and percentage
 * @throws {Error} If validation fails
 */
function calculatePercentageSplit(amount, splits, tolerance = 0.01) {
  if (!splits || !Array.isArray(splits) || splits.length === 0) {
    throw new Error('Splits array is required and cannot be empty');
  }

  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  // Calculate total percentage
  const totalPercentage = splits.reduce((sum, split) => {
    const percentage = split.percentage || 0;
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentages must be between 0 and 100');
    }
    return sum + percentage;
  }, 0);

  // Validate that total percentage equals 100 (within tolerance for floating point errors)
  if (Math.abs(totalPercentage - 100) > tolerance) {
    throw new Error(
      `Total percentage (${totalPercentage.toFixed(2)}%) must equal 100%`
    );
  }

  // Calculate amounts for each split based on percentages
  const processedSplits = splits.map((split, index) => {
    const percentage = split.percentage;
    // Calculate amount: (totalAmount * percentage) / 100
    const splitAmount = (amount * percentage) / 100;
    
    // Round to 2 decimal places
    const roundedAmount = parseFloat(splitAmount.toFixed(2));
    
    return {
      user: split.user,
      amount: roundedAmount,
      percentage: percentage
    };
  });

  // Adjust last person's amount to ensure total equals expense amount exactly
  // This handles rounding errors from percentage calculations
  const calculatedTotal = processedSplits.reduce((sum, split) => sum + split.amount, 0);
  const difference = parseFloat((amount - calculatedTotal).toFixed(2));
  
  if (Math.abs(difference) > 0.01) {
    // Adjust last person's amount by the difference
    const lastIndex = processedSplits.length - 1;
    processedSplits[lastIndex].amount = parseFloat(
      (processedSplits[lastIndex].amount + difference).toFixed(2)
    );
  }

  return processedSplits;
}

/**
 * Main function to calculate splits based on split type
 * 
 * @param {String} splitType - Type of split: 'equal', 'exact', or 'percentage'
 * @param {Number} amount - Total expense amount
 * @param {Array<ObjectId>} memberIds - Array of group member IDs (for equal split)
 * @param {Array<Object>} splits - Array of split objects (for exact/percentage split)
 * @returns {Array<Object>} Array of processed split objects
 * @throws {Error} If splitType is invalid or validation fails
 */
function calculateSplits(splitType, amount, memberIds = null, splits = null) {
  switch (splitType) {
    case 'equal':
      if (!memberIds) {
        throw new Error('Member IDs are required for equal split');
      }
      return calculateEqualSplit(amount, memberIds);

    case 'exact':
      if (!splits) {
        throw new Error('Splits array is required for exact split');
      }
      return calculateExactSplit(amount, splits);

    case 'percentage':
      if (!splits) {
        throw new Error('Splits array is required for percentage split');
      }
      return calculatePercentageSplit(amount, splits);

    default:
      throw new Error(`Invalid split type: ${splitType}. Must be 'equal', 'exact', or 'percentage'`);
  }
}

module.exports = {
  calculateEqualSplit,
  calculateExactSplit,
  calculatePercentageSplit,
  calculateSplits
};


