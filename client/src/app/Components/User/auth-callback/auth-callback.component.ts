import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AuthCallbackComponent implements OnInit {
  message = '';
  error = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const role = params['role'];

      console.log('Auth callback params:', params); // Debug log

      if (token && role) {
        localStorage.setItem('token', token);
        this.message = 'Connexion Google réussie !';
        console.log('Token stored in localStorage:', token);
        setTimeout(() => {
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1000); // Short delay to show success message
      } else {
        this.error = 'Échec de l\'authentification Google : paramètres manquants';
        console.error('Missing token or role:', { token, role });
        setTimeout(() => this.router.navigate(['/login'], { queryParams: { error: this.error } }), 2000);
      }
    });
  }
}
