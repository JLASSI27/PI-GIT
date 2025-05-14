// layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}
  logNavigation(route: string) {
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}
