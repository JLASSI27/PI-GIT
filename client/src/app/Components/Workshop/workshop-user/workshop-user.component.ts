import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workshops',
  templateUrl: './workshop-user.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
})
export class WorkshopUserComponent implements OnInit {
  workshops: any[] = [];
  isLoading = false;
  error = '';
  isLoggedIn: boolean = !!localStorage.getItem('token');

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchWorkshops();
  }

  fetchWorkshops() {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();

    this.http.get('http://localhost:3000/api/workshops', { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.workshops = response.data || [];
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la récupération des workshops';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.isLoggedIn = false;
          this.router.navigate(['/login']);
        }
      },
    });
  }

  getImageUrl(image: string): string {
    return image ? `http://localhost:3000/${image}` : 'assets/placeholder.jpg';
  }



  enroll(workshopId: string) {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/api/enrollments', { workshopId }, { headers }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Inscription en attente ! Vous recevrez une confirmation par email.');
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error.message || 'Erreur lors de l\'inscription';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.isLoggedIn = false;
          this.router.navigate(['/login']);
        }
      },
    });
  }
}
