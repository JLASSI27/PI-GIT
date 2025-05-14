// users.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  isLoading = false;
  error = '';
  showEditModal = false;
  editUser: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/user/getAll', { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.users = response;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la récupération des utilisateurs';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  openEditModal(user: any) {
    this.editUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editUser = null;
  }

  updateUser(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:3000/user/updateOne/${this.editUser._id}`, this.editUser, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.showEditModal = false;
        this.fetchUsers();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la mise à jour de l\'utilisateur';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  deleteUser(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/user/deleteOne/${id}`, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.fetchUsers();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la suppression de l\'utilisateur';
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }
}
