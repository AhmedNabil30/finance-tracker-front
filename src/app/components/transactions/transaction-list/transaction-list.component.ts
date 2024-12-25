import { Component, OnInit, Input } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  // Input property to limit the number of displayed transactions
  @Input() limit?: number;

  // Component state
  transactions: Transaction[] = [];
  showForm = false;
  selectedTransaction?: Transaction;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  // Getter to handle transaction limiting
  get visibleTransactions(): Transaction[] {
    const sortedTransactions = [...this.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (this.limit && this.limit > 0) {
      return sortedTransactions.slice(0, this.limit);
    }
    return sortedTransactions;
  }

  // Form management methods
  showAddForm() {
    // Reset selected transaction and show the form for adding
    this.selectedTransaction = undefined;
    this.showForm = true;
  }

  editTransaction(transaction: Transaction) {
    // Set the selected transaction and show the form for editing
    this.selectedTransaction = { ...transaction }; // Create a copy to prevent direct mutation
    this.showForm = true;
  }

  hideForm() {
    // Reset form state
    this.showForm = false;
    this.selectedTransaction = undefined;
  }

  // Transaction management methods
  loadTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        // You might want to show an error message to the user
      }
    });
  }

  onSaveTransaction(transaction: Transaction) {
    if (transaction.id) {
      // Update existing transaction
      this.transactionService.updateTransaction(transaction.id, transaction).subscribe({
        next: () => {
          this.loadTransactions();
          this.hideForm();
        },
        error: (error) => {
          console.error('Error updating transaction:', error);
          // Show error message to user
        }
      });
    } else {
      // Add new transaction
      this.transactionService.addTransaction(transaction).subscribe({
        next: () => {
          this.loadTransactions();
          this.hideForm();
        },
        error: (error) => {
          console.error('Error adding transaction:', error);
          // Show error message to user
        }
      });
    }
  }

  deleteTransaction(id?: number) {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          // Show error message to user
        }
      });
    }
  }
}