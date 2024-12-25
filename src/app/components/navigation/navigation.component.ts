import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  template: `
    <nav class="nav-container">
      <div class="nav-brand">
        <h1>Finance Tracker</h1>
      </div>
      
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active">
          <i class="material-icons">dashboard</i>
          Dashboard
        </a>
        <a routerLink="/transactions" routerLinkActive="active">
          <i class="material-icons">receipt_long</i>
          Transactions
        </a>
        <a routerLink="/reports" routerLinkActive="active">
          <i class="material-icons">bar_chart</i>
          Reports
        </a>
      </div>

      <div class="nav-profile">
        <div class="profile-menu" (click)="toggleProfileMenu()">
          <span class="user-name">{{ user?.name }}</span>
          <i class="material-icons">arrow_drop_down</i>
        </div>

        <div class="profile-dropdown" *ngIf="showProfileMenu">
          <div class="dropdown-item" (click)="logout()">
            <i class="material-icons">logout</i>
            Logout
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #2196F3;
    }

    .nav-links {
      display: flex;
      gap: 2rem;

      a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        text-decoration: none;
        padding: 0.5rem;
        border-radius: 4px;
        transition: all 0.3s ease;

        i {
          font-size: 20px;
        }

        &:hover {
          color: #2196F3;
          background: rgba(33, 150, 243, 0.1);
        }

        &.active {
          color: #2196F3;
          background: rgba(33, 150, 243, 0.1);
        }
      }
    }

    .nav-profile {
      position: relative;

      .profile-menu {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;

        &:hover {
          background: rgba(0,0,0,0.05);
        }

        .user-name {
          color: #333;
        }
      }

      .profile-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        min-width: 150px;

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: #333;
          cursor: pointer;

          &:hover {
            background: rgba(0,0,0,0.05);
          }

          i {
            font-size: 18px;
          }
        }
      }
    }
  `]
})
export class NavigationComponent {
  user: any;
  showProfileMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.currentUserValue;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}