import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface FamilyRecord {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
}

@Component({
  selector: 'app-public-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="container">
        <div class="header-row">
          <div>
            <h1>Family Trees</h1>
            <p class="lead">Explore public family histories and genealogical branches.</p>
          </div>
          <div class="search-box">
            <label class="sr-only" for="family-search">Search families</label>
            <input id="family-search" type="search" [(ngModel)]="query" (ngModelChange)="applyFilter()" placeholder="Search families..." />
          </div>
        </div>

        <div *ngIf="loading" class="card section">Loading families...</div>
        <div *ngIf="error" class="card section error">{{ error }}</div>

        <div *ngIf="!loading && !error">
          <div *ngIf="filteredFamilies.length === 0" class="card section empty-state">
            No public families match your search.
          </div>

          <div *ngIf="filteredFamilies.length > 0" class="grid grid-3">
            <article *ngFor="let family of filteredFamilies" class="card family-card">
              <div class="family-header">
                <h2>{{ family.name }}</h2>
                <span class="privacy">{{ family.privacy }}</span>
              </div>
              <p>{{ family.description || 'A family tree with rich ancestry and heritage information.' }}</p>
              <a class="button primary" [routerLink]="['/family', family.slug]">Explore</a>
            </article>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page { padding-top: 2rem; }
      .header-row { display: flex; justify-content: space-between; align-items: end; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
      h1 { margin-bottom: 0.4rem; }
      .lead { color: #5b5b57; margin-bottom: 0; }
      .search-box input { min-width: min(100%, 280px); padding: 0.7rem 0.9rem; border: 1px solid #ddd4ca; border-radius: 0.75rem; }
      .section { padding: 1.2rem; }
      .family-card { padding: 1.1rem; }
      .family-header { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
      .privacy { background: #edf3ee; color: #335339; padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.75rem; text-transform: uppercase; }
      .button { display: inline-block; margin-top: 0.75rem; }
      .error { color: #a64343; }
      .empty-state { color: #5b5b57; }
      .sr-only { position: absolute; opacity: 0; pointer-events: none; }
    `,
  ],
})
export class PublicDirectoryComponent implements OnInit {
  families: FamilyRecord[] = [];
  filteredFamilies: FamilyRecord[] = [];
  loading = true;
  error = '';
  query = '';

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.get<{ success: boolean; data: FamilyRecord[] }>('/families').subscribe({
      next: (response) => {
        this.families = response.data ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load family trees.';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const term = this.query.trim().toLowerCase();
    this.filteredFamilies = term
      ? this.families.filter((family) => family.name.toLowerCase().includes(term) || (family.description ?? '').toLowerCase().includes(term))
      : [...this.families];
  }
}
