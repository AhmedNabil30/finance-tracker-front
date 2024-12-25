import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction';
import { Chart, ChartConfiguration } from 'chart.js/auto';

interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
  avgTransactionAmount: number;
  largestExpense: number;
  largestIncome: number;
}

interface CategorySummary {
  income: number;
  expenses: number;
  total: number;
  transactionCount: number;
  percentage: number;
}

interface TrendData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

@Component({
  selector: 'app-transaction-report',
  templateUrl: './transaction-report.component.html',
  styleUrls: ['./transaction-report.component.css']
})
export class TransactionReportComponent implements OnInit, AfterViewInit {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  
  private trendChart?: Chart;
  private categoryChart?: Chart;
  transactions: Transaction[] = [];
  monthlyData: Array<{month: string, summary: MonthlySummary}> = [];
  categoryData: Array<{category: string, summary: CategorySummary}> = [];
  insights: Array<{type: string, icon: string, title: string, description: string}> = [];
  
  // Summary metrics
  totalIncome: number = 0;
  totalExpenses: number = 0;
  netBalance: number = 0;
  savingsRate: number = 0;
  incomeTrend: number = 0;
  expensesTrend: number = 0;
  
  // Date range
  startDate: Date = new Date();
  endDate: Date = new Date();
  
  // For template use
  Math = Math;

  constructor(private transactionService: TransactionService) {}
  ngAfterViewInit() {
    // Initialize charts after view is ready
    if (this.transactions.length > 0) {
      this.initializeCharts();
    }
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.calculateDateRange();
        this.calculateSummaryMetrics();
        this.calculateMonthlyData();
        this.calculateCategoryData();
        this.generateInsights();
        this.initializeCharts();
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  calculateDateRange() {
    if (this.transactions.length > 0) {
      const dates = this.transactions.map(t => new Date(t.date));
      this.startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      this.endDate = new Date(Math.max(...dates.map(d => d.getTime())));
    }
  }

  calculateSummaryMetrics() {
    // Calculate current month totals
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthTransactions = this.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthTransactions = this.transactions.filter(t => {
      const date = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Calculate current month totals
    const currentTotals = this.transactionService.calculateTotals(currentMonthTransactions);
    this.totalIncome = currentTotals.income;
    this.totalExpenses = currentTotals.expenses;
    this.netBalance = currentTotals.balance;

    // Calculate savings rate
    this.savingsRate = this.totalIncome > 0 
      ? Math.round((this.netBalance / this.totalIncome) * 100) 
      : 0;

    // Calculate trends
    const lastMonthTotals = this.transactionService.calculateTotals(lastMonthTransactions);
    this.incomeTrend = this.calculateTrendPercentage(lastMonthTotals.income, this.totalIncome);
    this.expensesTrend = this.calculateTrendPercentage(lastMonthTotals.expenses, this.totalExpenses);
  }

  calculateMonthlyData() {
    const monthlyGroups = this.groupTransactionsByMonth();
    this.monthlyData = Object.entries(monthlyGroups).map(([month, transactions]) => {
      const summary = this.calculateMonthlySummary(transactions);
      return { month, summary };
    }).sort((a, b) => b.month.localeCompare(a.month));
  }

  calculateCategoryData() {
    const categoryGroups = this.groupTransactionsByCategory();
    const totalAmount = Object.values(categoryGroups)
      .flatMap(transactions => transactions)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    this.categoryData = Object.entries(categoryGroups).map(([category, transactions]) => {
      const summary = this.calculateCategorySummary(transactions, totalAmount);
      return { category, summary };
    }).sort((a, b) => Math.abs(b.summary.total) - Math.abs(a.summary.total));
  }

  generateInsights() {
    const insights: Array<{type: string, icon: string, title: string, description: string}> = [];
    
    // Analyze spending trends
    if (this.expensesTrend > 20) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Increased Spending',
        description: `Your expenses have increased by ${this.expensesTrend}% compared to last month. Consider reviewing your budget.`
      });
    }

    // Check savings rate
    if (this.savingsRate > 20) {
      insights.push({
        type: 'success',
        icon: '💰',
        title: 'Healthy Savings',
        description: `Great job! You're saving ${this.savingsRate}% of your income this month.`
      });
    } else if (this.savingsRate < 10) {
      insights.push({
        type: 'warning',
        icon: '📊',
        title: 'Low Savings Rate',
        description: 'Your savings rate is below 10%. Consider ways to increase your savings.'
      });
    }

    // Analyze category spending
    const topExpenseCategory = this.categoryData
      .filter(c => c.summary.total < 0)
      .sort((a, b) => Math.abs(b.summary.total) - Math.abs(a.summary.total))[0];

    if (topExpenseCategory) {
      insights.push({
        type: 'info',
        icon: '📈',
        title: 'Top Expense Category',
        description: `${topExpenseCategory.category} is your highest expense category at ${Math.abs(topExpenseCategory.summary.total).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
      });
    }

    // Check income stability
    if (this.incomeTrend < -10) {
      insights.push({
        type: 'warning',
        icon: '📉',
        title: 'Decreased Income',
        description: `Your income has decreased by ${Math.abs(this.incomeTrend)}% compared to last month.`
      });
    }

    this.insights = insights;
  }

  // Helper methods for calculations
  private groupTransactionsByMonth(): Record<string, Transaction[]> {
    return this.transactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
      return groups;
    }, {});
  }

  private groupTransactionsByCategory(): Record<string, Transaction[]> {
    return this.transactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
      if (!groups[transaction.category]) {
        groups[transaction.category] = [];
      }
      groups[transaction.category].push(transaction);
      return groups;
    }, {});
  }

  private calculateMonthlySummary(transactions: Transaction[]): MonthlySummary {
    const totals = this.transactionService.calculateTotals(transactions);
    
    return {
      income: totals.income,
      expenses: totals.expenses,
      balance: totals.balance,
      transactionCount: transactions.length,
      avgTransactionAmount: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length 
        : 0,
      largestExpense: Math.min(...transactions.map(t => t.amount)),
      largestIncome: Math.max(...transactions.map(t => t.amount))
    };
  }

  private calculateCategorySummary(transactions: Transaction[], totalAmount: number): CategorySummary {
    const totals = this.transactionService.calculateTotals(transactions);
    const percentage = totalAmount > 0 
      ? Math.round((Math.abs(totals.balance) / totalAmount) * 100) 
      : 0;

    return {
      income: totals.income,
      expenses: totals.expenses,
      total: totals.balance,
      transactionCount: transactions.length,
      percentage
    };
  }

  private calculateTrendPercentage(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  }

  formatMonth(monthYear: string): string {
    const [year, month] = monthYear.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  // Chart initialization
  private initializeCharts() {
    this.initializeTrendChart();
    this.initializeCategoryChart();
  }

  private initializeTrendChart() {
    const ctx = (this.trendChartRef.nativeElement as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;
  
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlyData.map(d => this.formatMonth(d.month)).reverse(),
        datasets: [
          {
            label: 'Income',
            data: this.monthlyData.map(d => d.summary.income).reverse(),
            borderColor: '#4caf50',
            tension: 0.1
          },
          {
            label: 'Expenses',
            data: this.monthlyData.map(d => d.summary.expenses).reverse(),
            borderColor: '#f44336',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private initializeCategoryChart() {
    const ctx = (this.categoryChartRef.nativeElement as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;
  
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.categoryData.map(d => d.category),
        datasets: [{
          data: this.categoryData.map(d => Math.abs(d.summary.total)),
          backgroundColor: ['#4caf50', '#2196f3', '#f44336', '#ff9800', '#9c27b0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}