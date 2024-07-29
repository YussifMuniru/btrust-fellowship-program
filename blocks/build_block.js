import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';




class MempoolTransaction {
  constructor(transaction_id, fee, weight, parents) {
    this.transaction_id = transaction_id;
    this.fee = parseInt(fee, 10);
    this.weight = parseInt(weight, 10);
    this.parents = parents ? parents.split(';') : [];
  }
} 

   // Getting the current file's full path
   const __filename = fileURLToPath(import.meta.url);
  
   // Getting the directory name of the current file
   const __dirname = path.dirname(__filename);

const fetchAndProcessTransactions = () => {
 
  const data = fs.readFileSync(path.join(__dirname, 'mempool.new.csv'), 'utf8');
  return data.split('\n').map(line => {
    const [transaction_id, fee, weight, parents] = line.trim().replaceAll("\"", "").split(',');
    return new MempoolTransaction(transaction_id, fee, weight, parents);
  });
}

const isValidParentsCheck = (previousTransactionIds, transaction) => {
  if (transaction.parents.length) {
    return transaction.parents.every(parent => previousTransactionIds.has(parent));
  }
  return true;
}

const selectTransactionsForBlock = (transactions, maxBlockWeight) => {
  transactions.sort((a, b) => b.fee - a.fee);

  let totalWeight = 0;
  const acceptedTransactionIds = new Set();
  const acceptedTransactions = [];

  for (const transaction of transactions) {
    if (totalWeight >= maxBlockWeight) {
      break;
    }
    if (totalWeight + transaction.weight <= maxBlockWeight && isValidParentsCheck(acceptedTransactionIds, transaction)) {
      acceptedTransactions.push(transaction);
      acceptedTransactionIds.add(transaction.transaction_id);
      totalWeight += transaction.weight;
    }
  }

  return acceptedTransactions;
}

const getBlock = () => {
    
  return selectTransactionsForBlock(fetchAndProcessTransactions(), 4000000);

  
}


export { fetchAndProcessTransactions, selectTransactionsForBlock, getBlock };
