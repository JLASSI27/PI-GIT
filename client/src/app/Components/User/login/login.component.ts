import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
    choice: 'email'
  };
  verificationCode: string = '';
  showCodeInput = false;
  isLoading = false;
  message = '';
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.error = params['error'];
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.message = '';
    this.error = '';

    this.http.post('http://localhost:3000/login', this.loginData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.message.includes('sent')) {
            this.showCodeInput = true;
            this.message = 'Code de vérification envoyé !';
          } else {
            this.error = response.message || 'Erreur lors de la connexion';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error.message || 'Erreur du serveur';
        }
      });
  }

  resendCode() {
    this.isLoading = true;
    this.message = '';
    this.error = '';

    this.http.post('http://localhost:3000/login', this.loginData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.message.includes('sent')) {
            this.message = 'Nouveau code de vérification envoyé !';
          } else {
            this.error = response.message || 'Erreur lors de l\'envoi du code';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error.message || 'Erreur lors de l\'envoi du code';
        }
      });
  }

  verifyCode(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.message = '';
    this.error = '';

    this.http.post('http://localhost:3000/verifyCode', { email: this.loginData.email, code: this.verificationCode })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.message = 'Code vérifié avec succès !';
            console.log('Token stored in localStorage:', response.token);
            if (response.role === 'admin') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          } else {
            this.error = response.message || 'Erreur de vérification';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error.message || 'Code invalide';
        }
      });
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }
}
