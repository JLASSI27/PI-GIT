import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-organisateur',
  templateUrl: './register-organisateur.component.html',
  styleUrls: ['./register-organisateur.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreateOrganisateurComponent {
  organisateurData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    number: ''
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

    this.http.post('http://localhost:3000/organisateurRegister', this.organisateurData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.message = 'Organisateur créé avec succès !';
          form.resetForm();
          setTimeout(() => this.router.navigate(['/admin-dashboard']), 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error.message || 'Erreur lors de la création de l\'organisateur';
        }
      });
  }
}
