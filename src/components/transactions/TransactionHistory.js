// src/components/Transactions/TransactionHistory.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>
            {tx.type.toUpperCase()} - {tx.amount} USDT - {tx.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;
