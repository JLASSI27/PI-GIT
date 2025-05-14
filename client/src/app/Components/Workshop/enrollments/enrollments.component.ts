// enrollments.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enrollments',
  templateUrl: './enrollments.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class EnrollmentsComponent implements OnInit {
  enrollments: any[] = [];
  isLoading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchEnrollments();
  }

  fetchEnrollments() {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/api/enrollments', { headers }).subscribe({
      next: async (response: any) => {
        this.isLoading = false;
        this.enrollments = await Promise.all(
          response.map(async (enrollment: any) => {
            const workshopResponse = await this.http
              .get(`http://localhost:3000/api/workshops/${enrollment.workshopId}`, { headers })
              .toPromise();
            const workshop = (workshopResponse as any).data;

            const userResponse = await this.http
              .get(`http://localhost:3000/user/getOne/${enrollment.userId}`, { headers })
              .toPromise();
            const user = userResponse as any;

            return {
              ...enrollment,
              workshopTitle: workshop?.title || 'Atelier inconnu',
              userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Utilisateur inconnu',
              userEmail: user?.email || 'Email inconnu',
              userNumber: user?.number || 'Numéro inconnu',
            };
          })
        );
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la récupération des inscriptions';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  updateEnrollmentStatus(id: string) {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:3000/api/enrollments/${id}`, {}, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.fetchEnrollments();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la mise à jour du statut de l\'inscription';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  deleteEnrollment(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/api/enrollments/${id}`, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.fetchEnrollments();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la suppression de l\'inscription';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }
}
