import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl).pipe(
        map(transactions => 
            transactions.map(transaction => ({
                ...transaction,
                amount: Number(transaction.amount) // Ensure amount is a number
            }))
        )
    );
}


addTransaction(transaction: Transaction): Observable<Transaction> {
  const processedTransaction = {
      ...transaction,
      amount: Number(transaction.amount)
  };
  return this.http.post<Transaction>(this.apiUrl, processedTransaction);
}

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  // Get transaction by ID
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  // Calculate totals for dashboard
  calculateTotals(transactions: Transaction[]) {
    return transactions.reduce(
      (totals, transaction) => {
        if (transaction.type === 'income') {
          totals.income += transaction.amount;
        } else {
          totals.expenses += transaction.amount;
        }
        totals.balance = totals.income - totals.expenses;
        return totals;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
  }

  // Get monthly summary for reporting
  getMonthlyTransactionSummary(transactions: Transaction[]) {
    return transactions.reduce((summary: any, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!summary[monthYear]) {
        summary[monthYear] = {
          income: 0,
          expenses: 0,
          balance: 0
        };
      }

      if (transaction.type === 'income') {
        summary[monthYear].income += transaction.amount;
      } else {
        summary[monthYear].expenses += transaction.amount;
      }
      
      summary[monthYear].balance = summary[monthYear].income - summary[monthYear].expenses;
      
      return summary;
    }, {});
  }

  // Get category summary for reporting
  getCategorySummary(transactions: Transaction[]) {
    return transactions.reduce((summary: any, transaction) => {
      if (!summary[transaction.category]) {
        summary[transaction.category] = {
          income: 0,
          expenses: 0,
          total: 0
        };
      }

      if (transaction.type === 'income') {
        summary[transaction.category].income += transaction.amount;
      } else {
        summary[transaction.category].expenses += transaction.amount;
      }

      summary[transaction.category].total = 
        summary[transaction.category].income - summary[transaction.category].expenses;

      return summary;
    }, {});
  }
}