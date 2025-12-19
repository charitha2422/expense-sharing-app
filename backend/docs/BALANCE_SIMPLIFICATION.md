# Balance Simplification Algorithm

## Overview

The balance simplification algorithm minimizes the number of transactions needed to settle all debts in a group. Instead of having multiple chain transactions (A→B→C), it simplifies them to direct transactions (A→B, A→C).

## Algorithm Explanation (Step by Step)

### Step 1: Calculate Net Balance for Each Person

**What it does:**
- For each person, calculate: `(total amount they owe) - (total amount owed to them)`
- This gives us a single number representing their net position

**Example:**
```
Input balances:
  A owes B: 100
  B owes C: 50

Net balances:
  A: -100 (owes 100, owed 0)
  B: +50  (owes 0, owed 100, but owes 50 to C)
  C: +50  (owes 0, owed 50)
```

**Why:** We need to know each person's overall financial position before we can simplify.

---

### Step 2: Separate into Creditors and Debtors

**What it does:**
- **Creditors**: People with positive net balance (owed money)
- **Debtors**: People with negative net balance (owe money)
- People with zero net balance are settled and can be ignored

**Example:**
```
From Step 1:
  Debtors:  A (-100)
  Creditors: B (+50), C (+50)
```

**Why:** We need to match people who owe money with people who are owed money.

---

### Step 3: Greedy Matching

**What it does:**
- For each debtor (starting with the largest debt):
  1. Find creditors they can pay
  2. Pay creditors until the debtor's debt is settled
  3. Update creditor balances accordingly
- Process debtors in order from largest to smallest
- For each debtor, pay creditors in order from largest to smallest

**Example:**
```
Debtors: A (100)
Creditors: B (50), C (50)

Process A (debtor, 100):
  1. Pay B (creditor, 50) → A pays B 50
     - A's remaining debt: 50
     - B is now settled
  2. Pay C (creditor, 50) → A pays C 50
     - A is now settled
     - C is now settled

Result:
  A owes B: 50
  A owes C: 50
```

**Why:** By matching largest debts with largest credits first, we minimize the number of transactions needed.

---

### Step 4: Build Result

**What it does:**
- Create the final simplified balance map
- Only include transactions that are necessary (non-zero amounts)

**Example:**
```
Final simplified balances:
  A → B: 50
  A → C: 50
```

**Why:** This is the final output showing minimum transactions needed.

---

## Complete Example Walkthrough

### Input:
```
A owes B: 100
B owes C: 50
```

### Step-by-Step:

**Step 1: Calculate Net Balances**
```
A: -100 (owes 100)
B: +50  (owed 100, owes 50)
C: +50  (owed 50)
```

**Step 2: Separate**
```
Debtors:  A (100)
Creditors: B (50), C (50)
```

**Step 3: Greedy Match**
```
A (100) pays B (50) → A owes B: 50
A (50) pays C (50)  → A owes C: 50
```

**Step 4: Result**
```
A owes B: 50
A owes C: 50
```

### Before vs After:

**Before (Chain):**
- A pays B: 100
- B pays C: 50
- **Total transactions: 2**

**After (Simplified):**
- A pays B: 50
- A pays C: 50
- **Total transactions: 2** (but simpler - no chain)

---

## Time Complexity Analysis

### Time Complexity: **O(n²)**

Where `n` is the number of people in the group.

**Breakdown:**
1. **Calculate Net Balances**: O(n)
   - Iterate through all balance entries once
   - Each person processed once

2. **Separate Creditors/Debtors**: O(n)
   - Iterate through net balances once
   - Sort: O(n log n) in worst case, but typically O(n)

3. **Greedy Matching**: O(n²)
   - For each debtor (up to n): O(n)
   - For each creditor match: O(n) in worst case
   - Total: O(n × n) = O(n²)

4. **Build Result**: O(n)
   - Create result map: O(n) in worst case

**Overall: O(n²)**

### Space Complexity: **O(n)**

- Net balances map: O(n)
- Creditors/debtors arrays: O(n)
- Result map: O(n) in worst case

---

## Algorithm Properties

### Correctness
- ✅ All debts are settled (sum of net balances = 0)
- ✅ No debt is lost or created
- ✅ Final balances match original net positions

### Optimality
- ✅ Minimizes number of transactions (greedy approach)
- ⚠️ Note: This is a greedy algorithm, not guaranteed to be globally optimal, but works well in practice

### Edge Cases Handled
- ✅ Circular debts (A→B→C→A) cancel out completely
- ✅ Direct opposite debts (A→B and B→A) net out correctly
- ✅ Floating point precision issues (rounding to 2 decimals)
- ✅ Zero balances (settled people are skipped)

---

## Usage

```javascript
const BalanceSimplificationService = require('./services/balanceSimplificationService');

const balances = {
  'A': { 'B': 100 },
  'B': { 'C': 50 }
};

const simplified = BalanceSimplificationService.simplifyBalances(balances);
// Result: { 'A': { 'B': 50, 'C': 50 } }
```

---

## Real-World Example

### Scenario:
- Alice paid $90 for dinner (split equally: $30 each)
- Bob paid $60 for gas (split equally: $20 each)
- Charlie paid $30 for snacks (split equally: $10 each)

### Input Balances:
```
Alice owes Bob: 20
Alice owes Charlie: 10
Bob owes Alice: 30
Bob owes Charlie: 10
Charlie owes Alice: 30
Charlie owes Bob: 20
```

### Net Balances:
```
Alice: -30 + 30 + 30 = +30 (owed money)
Bob: +20 - 30 + 20 = +10 (owed money)
Charlie: +10 + 10 - 30 - 20 = -30 (owes money)
```

### Simplified:
```
Charlie owes Alice: 30
Charlie owes Bob: 10
```

### Result:
Instead of 6 transactions, we only need 2!

---

## Comparison with Other Approaches

### Naive Approach (No Simplification)
- Stores all individual debts
- **Transactions**: O(n²) in worst case
- **Example**: 10 people = up to 90 transactions

### Simple Netting (Previous Implementation)
- Only cancels direct opposite debts
- **Transactions**: Still O(n²) in worst case
- **Example**: A→B→C chain not simplified

### Advanced Simplification (Current)
- Uses greedy matching to minimize transactions
- **Transactions**: Typically O(n) to O(n²)
- **Example**: A→B→C chain becomes A→B, A→C

---

## Limitations

1. **Greedy Algorithm**: Not guaranteed to be globally optimal, but works well in practice
2. **Floating Point**: Uses rounding to 2 decimals, may have minor precision issues
3. **Complexity**: O(n²) may be slow for very large groups (1000+ people), but acceptable for typical use cases

---

## Future Improvements

1. **Optimal Algorithm**: Could use graph algorithms (minimum cost flow) for guaranteed optimal solution
2. **Caching**: Cache simplified balances until expenses change
3. **Incremental Updates**: Only recalculate affected balances when new expense added


