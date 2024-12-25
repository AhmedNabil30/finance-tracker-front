import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  currentDate = new Date();
  transactions: Transaction[] = [];
  showForm = false;
  Math = Math; // Make Math available in template

  totals = {
    balance: 0,
    income: 0,
    expenses: 0
  };

  balanceTrend = 0;
  incomeTrend = 0;
  expensesTrend = 0;
  topCategories: any[] = [];

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService
  ) {
    this.user = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.calculateTotals();
        this.calculateTrends();
        this.calculateTopCategories();
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  calculateTotals() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthTransactions = this.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    this.totals = this.transactionService.calculateTotals(currentMonthTransactions);
  }

  calculateTrends() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get last month's date
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter transactions for current and last month
    const currentMonthTransactions = this.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthTransactions = this.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Calculate totals for both months
    const currentTotals = this.transactionService.calculateTotals(currentMonthTransactions);
    const lastTotals = this.transactionService.calculateTotals(lastMonthTransactions);

    // Calculate trends
    this.balanceTrend = this.calculateTrendPercentage(lastTotals.balance, currentTotals.balance);
    this.incomeTrend = this.calculateTrendPercentage(lastTotals.income, currentTotals.income);
    this.expensesTrend = this.calculateTrendPercentage(lastTotals.expenses, currentTotals.expenses);
  }

  calculateTrendPercentage(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  }

  calculateTopCategories() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthTransactions = this.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const categoryTotals = currentMonthTransactions.reduce((acc: any, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0;
      }
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {});

    // Convert to array and sort by amount
    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a: any, b: any) => b.amount - a.amount);

    // Calculate percentages
    const totalAmount = sortedCategories.reduce((sum: number, cat: any) => sum + cat.amount, 0);
    this.topCategories = sortedCategories.slice(0, 5).map(cat => ({
      ...cat,
      percentage: Math.round((cat.amount as number / totalAmount) * 100)
    }));
  }

  showTransactionForm() {
    this.showForm = true;
  }

  hideTransactionForm() {
    this.showForm = false;
  }

  onSaveTransaction(transaction: Transaction) {
    this.transactionService.addTransaction(transaction).subscribe({
      next: () => {
        this.loadTransactions();
        this.hideTransactionForm();
      },
      error: (error) => {
        console.error('Error adding transaction:', error);
        // Could add error notification here
      }
    });
  }
}

