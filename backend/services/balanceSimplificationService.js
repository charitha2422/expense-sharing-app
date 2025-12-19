/**
 * Balance Simplification Service
 * 
 * Implements advanced balance simplification algorithm to minimize transactions.
 * 
 * Algorithm Overview:
 * 1. Calculate net balance for each person (total owed - total owed to them)
 * 2. Separate people into creditors (positive net) and debtors (negative net)
 * 3. Use greedy matching to settle debts with minimum transactions
 * 
 * Example:
 * Input: A owes B: 100, B owes C: 50
 * Step 1: Net balances: A = -100, B = 50, C = 50
 * Step 2: Debtors: A (-100), Creditors: B (50), C (50)
 * Step 3: Match A with B and C: A owes B: 50, A owes C: 50
 * Result: A owes B: 50, A owes C: 50 (simplified chain)
 */

/**
 * Simplify balances to minimize transactions
 * 
 * Algorithm Steps (in simple words):
 * 
 * Step 1: Calculate Net Balance for Each Person
 *    - For each person, calculate: (what they owe) - (what others owe them)
 *    - If result is negative: they are a debtor (they owe money)
 *    - If result is positive: they are a creditor (they are owed money)
 *    - If result is zero: they are settled (no net debt)
 * 
 * Step 2: Separate into Creditors and Debtors
 *    - Creditors: people with positive net balance (owed money)
 *    - Debtors: people with negative net balance (owe money)
 * 
 * Step 3: Greedy Matching
 *    - For each debtor (starting with largest debt):
 *      - Find creditors they can pay
 *      - Pay creditors until debtor's debt is settled
 *      - Update creditor balances accordingly
 *    - This minimizes transactions by matching largest debts with largest credits first
 * 
 * Step 4: Build Result
 *    - Create simplified balance map showing only necessary transactions
 * 
 * Time Complexity: O(n²) where n is the number of people
 * - Step 1: O(n) - calculate net for each person
 * - Step 2: O(n) - separate into creditors/debtors
 * - Step 3: O(n²) - for each debtor, match with creditors (worst case: each debtor matches with all creditors)
 * - Step 4: O(n) - build result
 * 
 * Space Complexity: O(n)
 * - Store net balances: O(n)
 * - Store creditors/debtors arrays: O(n)
 * - Result map: O(n) in worst case
 * 
 * @param {Object} balances - Balance map: { fromUserId: { toUserId: amount } }
 * @returns {Object} Simplified balance map with minimum transactions
 */
function simplifyBalances(balances) {
  // Step 1: Calculate net balance for each person
  const netBalances = calculateNetBalances(balances);
  
  // Step 2: Separate into creditors and debtors
  const { creditors, debtors } = separateCreditorsAndDebtors(netBalances);
  
  // Step 3: Greedy matching to minimize transactions
  const simplified = greedyMatch(debtors, creditors);
  
  return simplified;
}

/**
 * Step 1: Calculate net balance for each person
 * 
 * Net balance = (total amount they owe) - (total amount owed to them)
 * 
 * Example:
 * If A owes B: 100 and C owes A: 50
 * Then A's net balance = -100 + 50 = -50 (A is a debtor)
 * 
 * @param {Object} balances - Balance map: { fromUserId: { toUserId: amount } }
 * @returns {Object} Net balance map: { userId: netAmount }
 */
function calculateNetBalances(balances) {
  const netBalances = {};
  
  // Initialize all users
  for (const [fromUserId, toUsers] of Object.entries(balances)) {
    if (!netBalances[fromUserId]) {
      netBalances[fromUserId] = 0;
    }
    
    for (const [toUserId, amount] of Object.entries(toUsers)) {
      // fromUserId owes toUserId this amount
      netBalances[fromUserId] = (netBalances[fromUserId] || 0) - amount;
      netBalances[toUserId] = (netBalances[toUserId] || 0) + amount;
    }
  }
  
  return netBalances;
}

/**
 * Step 2: Separate people into creditors and debtors
 * 
 * Creditors: people with positive net balance (owed money)
 * Debtors: people with negative net balance (owe money)
 * 
 * @param {Object} netBalances - Net balance map: { userId: netAmount }
 * @returns {Object} Object with creditors and debtors arrays
 */
function separateCreditorsAndDebtors(netBalances) {
  const creditors = []; // People owed money (positive net)
  const debtors = [];   // People who owe money (negative net)
  
  for (const [userId, netAmount] of Object.entries(netBalances)) {
    // Round to 2 decimal places to handle floating point errors
    const roundedAmount = parseFloat(netAmount.toFixed(2));
    
    if (roundedAmount > 0.01) {
      // Creditor: owed money
      creditors.push({ userId, amount: roundedAmount });
    } else if (roundedAmount < -0.01) {
      // Debtor: owes money
      debtors.push({ userId, amount: Math.abs(roundedAmount) });
    }
    // If amount is ~0, person is settled, skip them
  }
  
  // Sort by amount (largest first) for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  
  return { creditors, debtors };
}

/**
 * Step 3: Greedy matching algorithm
 * 
 * For each debtor (starting with largest):
 *   1. Find creditors they can pay
 *   2. Pay creditors until debtor's debt is settled
 *   3. Update creditor balances
 * 
 * This minimizes transactions by matching largest debts with largest credits first.
 * 
 * Example:
 * Debtors: A (100), Creditors: B (50), C (50)
 * - A pays B 50 → A owes 50, B settled
 * - A pays C 50 → A settled, C settled
 * Result: A owes B: 50, A owes C: 50
 * 
 * @param {Array} debtors - Array of { userId, amount }
 * @param {Array} creditors - Array of { userId, amount }
 * @returns {Object} Simplified balance map: { fromUserId: { toUserId: amount } }
 */
function greedyMatch(debtors, creditors) {
  const simplified = {};
  
  // Create working copies to modify during matching
  const creditorMap = {};
  creditors.forEach(c => {
    creditorMap[c.userId] = c.amount;
  });
  
  // Process each debtor
  for (const debtor of debtors) {
    let remainingDebt = debtor.amount;
    
    // Find creditors to pay (greedy: pay largest creditors first)
    const sortedCreditors = Object.entries(creditorMap)
      .map(([userId, amount]) => ({ userId, amount }))
      .sort((a, b) => b.amount - a.amount);
    
    for (const creditor of sortedCreditors) {
      if (remainingDebt <= 0.01) break; // Debtor is settled
      if (creditor.amount <= 0.01) continue; // Creditor is settled
      
      // Calculate payment amount
      const payment = Math.min(remainingDebt, creditor.amount);
      
      // Round to 2 decimal places
      const roundedPayment = parseFloat(payment.toFixed(2));
      
      // Create simplified balance entry
      if (!simplified[debtor.userId]) {
        simplified[debtor.userId] = {};
      }
      simplified[debtor.userId][creditor.userId] = roundedPayment;
      
      // Update balances
      remainingDebt -= roundedPayment;
      creditorMap[creditor.userId] -= roundedPayment;
      
      // Clean up settled creditors
      if (creditorMap[creditor.userId] < 0.01) {
        delete creditorMap[creditor.userId];
      }
    }
    
    // If debtor still has remaining debt (shouldn't happen in valid scenarios)
    if (remainingDebt > 0.01) {
      console.warn(`Warning: Debtor ${debtor.userId} has remaining debt: ${remainingDebt}`);
    }
  }
  
  return simplified;
}

/**
 * Example function to demonstrate the algorithm
 * 
 * @param {Object} balances - Balance map: { fromUserId: { toUserId: amount } }
 * @returns {Object} Simplified balance map
 */
function demonstrateSimplification(balances) {
  console.log('=== Balance Simplification Demo ===');
  console.log('\nInput Balances:');
  printBalances(balances);
  
  const netBalances = calculateNetBalances(balances);
  console.log('\nNet Balances:');
  for (const [userId, amount] of Object.entries(netBalances)) {
    console.log(`  ${userId}: ${amount > 0 ? '+' : ''}${amount.toFixed(2)}`);
  }
  
  const simplified = simplifyBalances(balances);
  console.log('\nSimplified Balances:');
  printBalances(simplified);
  
  return simplified;
}

/**
 * Helper function to print balances in readable format
 */
function printBalances(balances) {
  for (const [fromUserId, toUsers] of Object.entries(balances)) {
    for (const [toUserId, amount] of Object.entries(toUsers)) {
      console.log(`  ${fromUserId} owes ${toUserId}: ${amount.toFixed(2)}`);
    }
  }
}

module.exports = {
  simplifyBalances,
  calculateNetBalances,
  separateCreditorsAndDebtors,
  greedyMatch,
  demonstrateSimplification
};


