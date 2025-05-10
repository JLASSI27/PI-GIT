import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  showDropdown: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  login() {
    this.router.navigate(['/login']);
  }

  disconnect() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.showDropdown = false;
    this.router.navigate(['/home']);
  }

  changePassword() {
    this.router.navigate(['/change-password']);
    this.showDropdown = false;
  }
}
