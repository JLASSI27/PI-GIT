import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class RegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    number: ''
  };
  isLoading = false;
  message = '';
  error = '';

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.error = 'Veuillez remplir tous les champs correctement';
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.error = '';

    const { firstName, lastName, email, password, number } = this.user;
    const registerData = { firstName, lastName, email, password, number };

    this.http.post('http://localhost:3000/userRegister', registerData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.message = 'Inscription réussie ! Veuillez vérifier votre email ou téléphone pour le code de vérification.';
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error.message || 'Erreur lors de l\'inscription';
        }
      });
  }
}
