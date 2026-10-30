import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="container login-shell">
        <div class="card login-card">
          <h1>Admin Login</h1>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-row">
              <label for="email">Email</label>
              <input id="email" type="email" formControlName="email" />
            </div>

            <div class="form-row">
              <label for="password">Password</label>
              <input id="password" type="password" formControlName="password" />
            </div>

            <div *ngIf="error" class="error">{{ error }}</div>
            <button class="button primary" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing in...' : 'Login' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .login-shell { display: grid; place-items: center; min-height: 70vh; }
      .login-card { padding: 2rem; width: min(100%, 400px); }
      .button { width: 100%; }
      .error { color: #a64343; margin: 0.5rem 0 1rem; }
    `,
  ],
})
export class AdminLoginComponent {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  error = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const { email, password } = this.form.getRawValue();
    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/admin/dashboard']);
          return;
        }

        this.error = 'Unable to sign in.';
        this.loading = false;
      },
      error: () => {
        this.error = 'Invalid email or password.';
        this.loading = false;
      },
    });
  }
}
