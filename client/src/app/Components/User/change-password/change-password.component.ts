import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChangePasswordComponent {
  passwordData = {
    email: '',
    newPassword: ''
  };
  isLoading = false;
  message = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.message = '';
    this.error = '';

    this.http.post('http://localhost:3000/resetPassword', this.passwordData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.message = 'Lien de réinitialisation envoyé à votre email';
          localStorage.clear()
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error.message || 'Erreur lors de l\'envoi du lien';
        }
      });
  }
}
