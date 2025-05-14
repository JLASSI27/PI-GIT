import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  workshops: any[] = [];
  isLoading: boolean = false;
  error: string = '';
  defaultImage: string = 'https://via.placeholder.com/400x200';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.fetchWorkshops();
  }

  fetchWorkshops() {
    this.isLoading = true;
    this.error = '';

    this.http.get('http://localhost:3000/api/workshops')
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.workshops = response.data.map((workshop: any) => ({
            ...workshop,
            image: workshop.image || null // Ensure image is null if undefined
          }));
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la récupération des workshops';
        }
      });
  }

  getImageUrl(imagePath: string | null): string {
    if (!imagePath) {
      return this.defaultImage;
    }
    // Use 'images/' based on multer destination
    return `http://localhost:3000/images/${imagePath}`;
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultImage;
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

  enroll(workshopId: string) {
    if (!this.isLoggedIn) {
      // Store the workshop ID to redirect back after login
      localStorage.setItem('redirectWorkshopId', workshopId);
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post('http://localhost:3000/enrollments', { workshopId }, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          alert('Inscription réussie ! Vous recevrez un email de confirmation.');
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            localStorage.setItem('redirectWorkshopId', workshopId);
            this.isLoggedIn = false;
            this.router.navigate(['/login']);
          } else if (error.status === 400 && error.error.message === 'Capacité atteinte pour cet atelier') {
            this.error = 'Désolé, cet atelier est complet.';
          } else {
            this.error = error.error.message || 'Erreur lors de l\'inscription';
          }
        }
      });
  }
}
