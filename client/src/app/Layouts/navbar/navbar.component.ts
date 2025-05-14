import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class NavbarComponent {
  isLoggedIn: boolean = !!localStorage.getItem('token');
  showDropdown: boolean = false;

  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/login']);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  changePassword() {
    this.showDropdown = false;
    this.router.navigate(['/change-password']);
  }

  disconnect() {
    localStorage.clear();
    this.isLoggedIn = false;
    this.showDropdown = false;
    this.router.navigate(['/home']);
  }
}
