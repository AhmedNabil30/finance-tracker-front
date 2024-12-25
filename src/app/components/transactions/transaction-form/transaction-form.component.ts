// transaction-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Transaction } from '../../../models/transaction';

@Component({
  selector: 'app-transaction-form',
  templateUrl:'./transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
  @Input() transaction?: Transaction;
  @Output() save = new EventEmitter<Transaction>();
  @Output() cancel = new EventEmitter<void>();

  transactionForm: FormGroup;
  submitted = false;
  isEditing = false;

  // Categories could be moved to a shared service or configuration
  categories = [
    'Salary',
    'Freelance',
    'Investments',
    'Food',
    'Transport',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Others'
  ];

  constructor(private formBuilder: FormBuilder) {
    this.transactionForm = this.formBuilder.group({
      type: ['income', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: ['Others', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit() {
    if (this.transaction) {
      this.isEditing = true;
      this.transactionForm.patchValue({
        type: this.transaction.type,
        amount: this.transaction.amount,
        description: this.transaction.description,
        category: this.transaction.category,
        date: new Date(this.transaction.date).toISOString().split('T')[0]
      });
    }
  }

  get f() { return this.transactionForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.transactionForm.invalid) {
      return;
    }

    const formValues = this.transactionForm.value;
    const transaction: Transaction = {
      id: this.transaction?.id,
      userId: this.transaction?.userId || 0, // Should come from auth service
      ...formValues
    };

    this.save.emit(transaction);
  }

  onCancel() {
    this.cancel.emit();
  }
}