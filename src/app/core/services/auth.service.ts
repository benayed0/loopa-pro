import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Signal pour l'utilisateur connecté
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Charger le token et récupérer l'utilisateur au démarrage
    this.loadUserFromToken();
  }

  requestMagicLink(email: string): Observable<{ message: string; magicToken?: string }> {
    return this.apiService.requestMagicLink(email);
  }

  verifyMagicToken(token: string): Observable<{ message: string; accessToken: string; user: User }> {
    return this.apiService.verifyMagicToken(token).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setUser(response.user);
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('loopa_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('loopa_token');
  }

  setUser(user: User) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('loopa_token');
    this.router.navigate(['/auth/login']);
  }

  private loadUserFromToken() {
    const token = this.getToken();
    if (token) {
      // Fetch current user profile from backend using JWT token
      this.apiService.getCurrentUser().pipe(
        tap(user => {
          this.setUser(user);
        }),
        catchError(error => {
          console.error('Error loading user from token:', error);
          // Only clear token if it's actually invalid (401/403), not for network errors
          if (error.status === 401 || error.status === 403) {
            console.log('Token is invalid, clearing it');
            localStorage.removeItem('loopa_token');
          } else {
            console.log('Network or server error, keeping token');
          }
          return of(null);
        })
      ).subscribe();
    }
  }

  hasRole(role: 'owner' | 'manager' | 'staff'): boolean {
    const user = this.currentUser();
    return user?.roles.includes(role) || false;
  }

  isOwnerOrManager(): boolean {
    return this.hasRole('owner') || this.hasRole('manager');
  }
}
