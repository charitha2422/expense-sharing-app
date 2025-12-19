/**
 * Examples of using the Expense Split Service functions
 * 
 * This file demonstrates how to use each split type function
 * with example data and expected outputs.
 */

const ExpenseSplitService = require('../../services/expenseSplitService');

// Example 1: Equal Split
console.log('=== Equal Split Example ===');
try {
  const memberIds = ['user1', 'user2', 'user3'];
  const amount = 100;
  
  const equalSplits = ExpenseSplitService.calculateEqualSplit(amount, memberIds);
  console.log('Total amount:', amount);
  console.log('Number of members:', memberIds.length);
  console.log('Splits:', equalSplits);
  console.log('Total of splits:', equalSplits.reduce((sum, s) => sum + s.amount, 0));
  // Expected: Each person gets $33.33, but last person gets $33.34 to make total $100.00
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n');

// Example 2: Exact Amount Split
console.log('=== Exact Amount Split Example ===');
try {
  const amount = 150;
  const splits = [
    { user: 'user1', amount: 50 },
    { user: 'user2', amount: 75 },
    { user: 'user3', amount: 25 }
  ];
  
  const exactSplits = ExpenseSplitService.calculateExactSplit(amount, splits);
  console.log('Total amount:', amount);
  console.log('Input splits:', splits);
  console.log('Processed splits:', exactSplits);
  console.log('Total of splits:', exactSplits.reduce((sum, s) => sum + s.amount, 0));
  // Expected: Same amounts, rounded to 2 decimals
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n');

// Example 3: Percentage Split
console.log('=== Percentage Split Example ===');
try {
  const amount = 200;
  const splits = [
    { user: 'user1', percentage: 50 },
    { user: 'user2', percentage: 30 },
    { user: 'user3', percentage: 20 }
  ];
  
  const percentageSplits = ExpenseSplitService.calculatePercentageSplit(amount, splits);
  console.log('Total amount:', amount);
  console.log('Input splits:', splits);
  console.log('Processed splits:', percentageSplits);
  console.log('Total of splits:', percentageSplits.reduce((sum, s) => sum + s.amount, 0));
  // Expected: user1 gets $100 (50%), user2 gets $60 (30%), user3 gets $40 (20%)
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n');

// Example 4: Using the main calculateSplits function
console.log('=== Using calculateSplits Function ===');
try {
  const amount = 90;
  
  // Equal split
  const equalSplits = ExpenseSplitService.calculateSplits(
    'equal',
    amount,
    ['user1', 'user2', 'user3']
  );
  console.log('Equal splits:', equalSplits);
  
  // Exact split
  const exactSplits = ExpenseSplitService.calculateSplits(
    'exact',
    amount,
    null,
    [
      { user: 'user1', amount: 30 },
      { user: 'user2', amount: 30 },
      { user: 'user3', amount: 30 }
    ]
  );
  console.log('Exact splits:', exactSplits);
  
  // Percentage split
  const percentageSplits = ExpenseSplitService.calculateSplits(
    'percentage',
    amount,
    null,
    [
      { user: 'user1', percentage: 33.33 },
      { user: 'user2', percentage: 33.33 },
      { user: 'user3', percentage: 33.34 }
    ]
  );
  console.log('Percentage splits:', percentageSplits);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n');

// Example 5: Error handling
console.log('=== Error Handling Examples ===');

// Invalid total for exact split
try {
  ExpenseSplitService.calculateExactSplit(100, [
    { user: 'user1', amount: 50 },
    { user: 'user2', amount: 40 } // Total is 90, not 100
  ]);
} catch (error) {
  console.log('Expected error for invalid total:', error.message);
}

// Invalid percentage total
try {
  ExpenseSplitService.calculatePercentageSplit(100, [
    { user: 'user1', percentage: 50 },
    { user: 'user2', percentage: 40 } // Total is 90%, not 100%
  ]);
} catch (error) {
  console.log('Expected error for invalid percentage:', error.message);
}


