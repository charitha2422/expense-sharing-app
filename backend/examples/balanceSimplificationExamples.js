/**
 * Examples demonstrating balance simplification algorithm
 * 
 * This file shows how the balance simplification works with various scenarios
 */

const BalanceSimplificationService = require('../../services/balanceSimplificationService');

console.log('=== Balance Simplification Examples ===\n');

// Example 1: Simple chain simplification (from requirements)
console.log('Example 1: Chain Simplification');
console.log('Input: A owes B: 100, B owes C: 50');
const example1 = {
  'A': { 'B': 100 },
  'B': { 'C': 50 }
};
BalanceSimplificationService.demonstrateSimplification(example1);
console.log('\nExpected: A owes B: 50, A owes C: 50\n');

// Example 2: Direct opposite debts (should cancel)
console.log('Example 2: Opposite Debts');
console.log('Input: A owes B: 100, B owes A: 50');
const example2 = {
  'A': { 'B': 100 },
  'B': { 'A': 50 }
};
BalanceSimplificationService.demonstrateSimplification(example2);
console.log('\nExpected: A owes B: 50\n');

// Example 3: Complex chain
console.log('Example 3: Complex Chain');
console.log('Input: A owes B: 100, B owes C: 80, C owes D: 50');
const example3 = {
  'A': { 'B': 100 },
  'B': { 'C': 80 },
  'C': { 'D': 50 }
};
BalanceSimplificationService.demonstrateSimplification(example3);
console.log('\nExpected: A owes B: 20, A owes C: 30, A owes D: 50\n');

// Example 4: Multiple creditors
console.log('Example 4: Multiple Creditors');
console.log('Input: A owes B: 60, A owes C: 40, D owes A: 50');
const example4 = {
  'A': { 'B': 60, 'C': 40 },
  'D': { 'A': 50 }
};
BalanceSimplificationService.demonstrateSimplification(example4);
console.log('\nExpected: A owes B: 30, A owes C: 20, D owes B: 30, D owes C: 20\n');

// Example 5: Circular debts
console.log('Example 5: Circular Debts');
console.log('Input: A owes B: 100, B owes C: 100, C owes A: 100');
const example5 = {
  'A': { 'B': 100 },
  'B': { 'C': 100 },
  'C': { 'A': 100 }
};
BalanceSimplificationService.demonstrateSimplification(example5);
console.log('\nExpected: All debts cancel out (no balances)\n');

// Example 6: Real-world scenario
console.log('Example 6: Real-world Group Expense Scenario');
console.log('Input:');
console.log('  - Alice paid $90 for dinner (split equally among 3)');
console.log('  - Bob paid $60 for gas (split equally among 3)');
console.log('  - Charlie paid $30 for snacks (split equally among 3)');
const example6 = {
  'Alice': { 'Bob': 30, 'Charlie': 30 },    // Alice paid 90, Bob and Charlie owe 30 each
  'Bob': { 'Alice': 30, 'Charlie': 30 },     // Bob paid 60, Alice and Charlie owe 30 each
  'Charlie': { 'Alice': 30, 'Bob': 30 }      // Charlie paid 30, Alice and Bob owe 30 each
};
BalanceSimplificationService.demonstrateSimplification(example6);
console.log('\nExpected: All debts cancel out (everyone paid equally)\n');

// Example 7: Unequal expenses
console.log('Example 7: Unequal Expenses');
console.log('Input:');
console.log('  - Alice paid $100 (Alice owes 50, Bob owes 30, Charlie owes 20)');
console.log('  - Bob paid $60 (split equally)');
const example7 = {
  'Alice': { 'Bob': 30, 'Charlie': 20 },     // Alice paid 100, owes 50 herself
  'Bob': { 'Alice': 20, 'Charlie': 20 }      // Bob paid 60, split equally
};
BalanceSimplificationService.demonstrateSimplification(example7);
console.log('\n');

// Manual test of the algorithm steps
console.log('=== Algorithm Step-by-Step Demo ===\n');
console.log('Input: A owes B: 100, B owes C: 50\n');

const balances = {
  'A': { 'B': 100 },
  'B': { 'C': 50 }
};

console.log('Step 1: Calculate Net Balances');
const netBalances = BalanceSimplificationService.calculateNetBalances(balances);
for (const [userId, amount] of Object.entries(netBalances)) {
  console.log(`  ${userId}: ${amount > 0 ? '+' : ''}${amount.toFixed(2)}`);
}

console.log('\nStep 2: Separate Creditors and Debtors');
const { creditors, debtors } = BalanceSimplificationService.separateCreditorsAndDebtors(netBalances);
console.log('  Debtors (owe money):');
debtors.forEach(d => console.log(`    ${d.userId}: ${d.amount.toFixed(2)}`));
console.log('  Creditors (owed money):');
creditors.forEach(c => console.log(`    ${c.userId}: ${c.amount.toFixed(2)}`));

console.log('\nStep 3: Greedy Matching');
console.log('  - Match A (debtor, 100) with B (creditor, 50) → A pays B 50');
console.log('  - Match A (remaining 50) with C (creditor, 50) → A pays C 50');
console.log('  - Result: A owes B: 50, A owes C: 50');

const simplified = BalanceSimplificationService.simplifyBalances(balances);
console.log('\nFinal Result:');
BalanceSimplificationService.demonstrateSimplification(balances);


