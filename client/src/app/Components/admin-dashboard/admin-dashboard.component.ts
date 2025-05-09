import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminDashboardComponent {
  users: any[] = [];
  organisateurs: any[] = [];
  selectedView: 'users' | 'organisateurs' | null = null;
  isLoading = false;
  error = '';
  showEditModal = false;
  editUser: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  fetchUsers() {
    this.isLoading = true;
    this.error = '';
    this.selectedView = 'users';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/user/getAll', { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.users = response;
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la récupération des utilisateurs';
          if (error.status === 401 || error.status === 403 || error.status === 400) {
            alert('Vous n\'êtes pas un administrateur.');
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  Logout(){
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  fetchOrganisateurs() {
    this.isLoading = true;
    this.error = '';
    this.selectedView = 'organisateurs';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/organisateur/getAll', { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.organisateurs = response;
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la récupération des organisateurs';
          if (error.status === 401 || error.status === 403 || error.status === 400) {
            alert('Vous n\'êtes pas un administrateur.');
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
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

    this.http.put(`http://localhost:3000/user/updateOne/${this.editUser._id}`, this.editUser, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.showEditModal = false;
          if (this.selectedView === 'users') {
            this.fetchUsers();
          } else {
            this.fetchOrganisateurs();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la mise à jour de l\'utilisateur';
          if (error.status === 401 || error.status === 403 || error.status === 400) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  deleteUser(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/user/deleteOne/${id}`, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (this.selectedView === 'users') {
            this.fetchUsers();
          } else {
            this.fetchOrganisateurs();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la suppression de l\'utilisateur';
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  verifyOrganisateur(id: string) {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.patch(`http://localhost:3000/admin/verifyOrganisateur/${id}`, {}, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.fetchOrganisateurs();
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la vérification de l\'organisateur';
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }
}
