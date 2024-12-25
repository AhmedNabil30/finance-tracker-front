import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-navigation *ngIf="isAuthenticated"></app-navigation>
      
      <main class="main-content" [class.auth-page]="!isAuthenticated">
        <app-loader></app-loader>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .main-content {
      padding: 20px;
      
      &.auth-page {
        padding: 0;
      }
    }
  `]
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}