import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  success: boolean;
  data?: {
    user?: { email: string };
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem('family-tree-admin', 'true');
        }
      })
    );
  }

  logout(): void {
    void this.http.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).subscribe();
    localStorage.removeItem('family-tree-admin');
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('family-tree-admin') === 'true';
  }
}
