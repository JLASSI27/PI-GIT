import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-orgonizers',
  templateUrl: './orgonizers.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OrganizersComponent implements OnInit {
  organizers: any[] = [];
  isLoading = false;
  error = '';
  showEditModal = false;
  editOrganizer: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchOrganizers();
  }

  fetchOrganizers() {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/organisateur/getAll', { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.organizers = response;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la récupération des organisateurs';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  verifyOrganizer(id: string) {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.patch(`http://localhost:3000/organisateur/verifyOrganisateur/${id}`, {}, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.fetchOrganizers();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la vérification de l\'organisateur';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  openEditModal(organizer: any) {
    this.editOrganizer = { ...organizer };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editOrganizer = null;
  }

  updateOrganizer(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:3000/user/updateOne/${this.editOrganizer._id}`, this.editOrganizer, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.showEditModal = false;
        this.fetchOrganizers();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la mise à jour de l\'organisateur';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  deleteOrganizer(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet organisateur ?')) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/user/deleteOne/${id}`, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.fetchOrganizers();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la suppression de l\'organisateur';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }
}
