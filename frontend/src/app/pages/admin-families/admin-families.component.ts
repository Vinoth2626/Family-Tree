import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface FamilyItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
}

@Component({
  selector: 'app-admin-families',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="container">
        <div class="toolbar">
          <h1>Your Families</h1>
          <a class="button secondary" routerLink="/admin/dashboard">Back to dashboard</a>
        </div>

        <div class="grid grid-2">
          <div class="card section">
            <h2>Create Family</h2>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <div class="form-row">
                <label for="name">Family Name</label>
                <input id="name" formControlName="name" />
              </div>
              <div class="form-row">
                <label for="description">Description</label>
                <textarea id="description" formControlName="description"></textarea>
              </div>
              <div class="form-row">
                <label for="privacy">Privacy</label>
                <select id="privacy" formControlName="privacy">
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
              <button class="button primary" type="submit" [disabled]="form.invalid || saving">
                {{ saving ? 'Creating...' : 'Create Family' }}
              </button>
            </form>
            <div *ngIf="error" class="error">{{ error }}</div>
            <div *ngIf="message" class="success">{{ message }}</div>
          </div>

          <div class="card section">
            <h2>Family List</h2>
            <div *ngIf="loading">Loading families...</div>
            <div *ngIf="!loading && families.length === 0">No families found.</div>
            <ul class="family-list" *ngIf="families.length">
              <li *ngFor="let family of families">
                <div>
                  <strong>{{ family.name }}</strong>
                  <small>{{ family.privacy }} • {{ family.slug }}</small>
                </div>
                <a class="button secondary" [routerLink]="['/admin/families', family._id]">Open</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    '.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }',
    '.section { padding: 1.2rem; }',
    '.family-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 1rem; }',
    '.family-list li { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.75rem; }',
    '.family-list small { display: block; color: #5b5b57; margin-top: 0.2rem; }',
    '.error { color: #a64343; margin-top: 1rem; }',
    '.success { color: #335339; margin-top: 1rem; }',
    '.button { display: inline-flex; align-items: center; justify-content: center; }'
  ],
})
export class AdminFamiliesComponent implements OnInit {
  families: FamilyItem[] = [];
  loading = true;
  saving = false;
  error = '';
  message = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    privacy: ['PUBLIC' as 'PUBLIC' | 'PRIVATE', Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.loadFamilies();
  }

  submit(): void {
    if (this.form.invalid) return;

    this.saving = true;
    this.error = '';
    this.message = '';

    this.apiService.post<{ success: boolean; data: FamilyItem }>('/admin/families', this.form.getRawValue()).subscribe({
      next: (response) => {
        this.message = `Created ${response.data.name}.`;
        this.form.reset({ name: '', description: '', privacy: 'PUBLIC' });
        this.saving = false;
        this.loadFamilies();
      },
      error: () => {
        this.error = 'We could not create the family.';
        this.saving = false;
      },
    });
  }

  private loadFamilies(): void {
    this.apiService.get<{ success: boolean; data: FamilyItem[] }>('/admin/families').subscribe({
      next: (response) => {
        this.families = response.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load families.';
        this.loading = false;
      },
    });
  }
}
