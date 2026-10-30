import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface DashboardStats {
  totalFamilies: number;
  totalMembers: number;
  totalRelationships: number;
  publicFamilies: number;
  privateFamilies: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="container">
        <div class="dashboard-header">
          <div>
            <h1>Family Tree Admin</h1>
            <p>Manage families and genealogical records.</p>
          </div>
          <button class="button secondary" (click)="logout()">Logout</button>
        </div>

        <div *ngIf="loading" class="card section">Loading dashboard...</div>
        <div *ngIf="error" class="card section error">{{ error }}</div>

        <div *ngIf="!loading && stats" class="grid grid-3">
          <div class="card stat-card"><h3>Families</h3><strong>{{ stats.totalFamilies }}</strong></div>
          <div class="card stat-card"><h3>Members</h3><strong>{{ stats.totalMembers }}</strong></div>
          <div class="card stat-card"><h3>Relationships</h3><strong>{{ stats.totalRelationships }}</strong></div>
          <div class="card stat-card"><h3>Public</h3><strong>{{ stats.publicFamilies }}</strong></div>
          <div class="card stat-card"><h3>Private</h3><strong>{{ stats.privateFamilies }}</strong></div>
          <div class="card stat-card"><h3>Overview</h3><strong>Ready</strong></div>
        </div>

        <div *ngIf="!loading && stats" class="card section actions">
          <button class="button primary" (click)="goToFamilies()">Manage Families</button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .dashboard-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
      .section { padding: 1.2rem; }
      .stat-card { padding: 1.2rem; text-align: center; }
      .stat-card strong { display: block; font-size: 2rem; margin-top: 0.4rem; }
      .actions { margin-top: 1rem; }
      .error { color: #a64343; }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.apiService.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard').subscribe({
      next: (response) => {
        this.stats = response.data ?? null;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard.';
        this.loading = false;
      },
    });
  }

  goToFamilies(): void {
    this.router.navigate(['/admin/families']);
  }

  logout(): void {
    this.authService.logout();
  }
}
