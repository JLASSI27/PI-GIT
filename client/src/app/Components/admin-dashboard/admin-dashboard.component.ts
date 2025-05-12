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
  workshops: any[] = [];
  enrollments: any[] = [];
  selectedView: 'users' | 'organisateurs' | 'create-organisateur' | 'workshops' | 'enrollments' | null = null;
  isLoading = false;
  error = '';
  showEditModal = false;
  showWorkshopModal = false;
  isEditingWorkshop = false;
  editUser: any = null;
  editWorkshop: any = {
    title: '',
    description: '',
    category: '',
    price: null,
    location: '',
    startDate: '',
    endDate: '',
    capacity: null,
    image: null
  };

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
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
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
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  fetchWorkshops() {
    this.isLoading = true;
    this.error = '';
    this.selectedView = 'workshops';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/api/workshops', { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.workshops = response.data;
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la récupération des workshops';
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  fetchEnrollments() {
    this.isLoading = true;
    this.error = '';
    this.selectedView = 'enrollments';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/api/enrollments', { headers })
      .subscribe({
        next: async (response: any) => {
          this.isLoading = false;
          // Enrich enrollments with workshop title and user details
          this.enrollments = await Promise.all(response.map(async (enrollment: any) => {
            // Fetch workshop details
            const workshopResponse = await this.http.get(`http://localhost:3000/api/workshops/${enrollment.workshopId}`, { headers }).toPromise();
            const workshop = (workshopResponse as any).data;

            // Fetch user details
            const userResponse = await this.http.get(`http://localhost:3000/user/getOne/${enrollment.userId}`, { headers }).toPromise();
            const user = userResponse as any;

            return {
              ...enrollment,
              workshopTitle: workshop?.title || 'Atelier inconnu',
              userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Utilisateur inconnu',
              userEmail: user?.email || 'Email inconnu',
              userNumber: user?.number || 'Numéro inconnu'
            };
          }));
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la récupération des inscriptions';
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  navigateToCreateOrganisateur() {
    this.selectedView = 'create-organisateur';
    this.router.navigate(['/create-organisateur']);
  }
Logout(){
    localStorage.clear();
    this.router.navigate(['/home']);
}
  openEditModal(user: any) {
    this.editUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editUser = null;
  }

  openCreateWorkshopModal() {
    this.isEditingWorkshop = false;
    this.editWorkshop = {
      title: '',
      description: '',
      category: '',
      price: null,
      location: '',
      startDate: '',
      endDate: '',
      capacity: null,
      image: null
    };
    this.showWorkshopModal = true;
  }

  openEditWorkshopModal(workshop: any) {
    this.isEditingWorkshop = true;
    this.editWorkshop = {
      _id: workshop._id,
      title: workshop.title,
      description: workshop.description,
      category: workshop.category,
      price: workshop.price,
      location: workshop.location,
      startDate: new Date(workshop.startDate).toISOString().split('T')[0],
      endDate: workshop.endDate ? new Date(workshop.endDate).toISOString().split('T')[0] : '',
      capacity: workshop.capacity,
      image: null
    };
    this.showWorkshopModal = true;
  }

  closeWorkshopModal() {
    this.showWorkshopModal = false;
    this.editWorkshop = {
      title: '',
      description: '',
      category: '',
      price: null,
      location: '',
      startDate: '',
      endDate: '',
      capacity: null,
      image: null
    };
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      this.editWorkshop.image = event.target.files[0];
    }
  }

  saveWorkshop(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('title', this.editWorkshop.title);
    formData.append('description', this.editWorkshop.description);
    formData.append('category', this.editWorkshop.category);
    formData.append('price', this.editWorkshop.price.toString());
    formData.append('location', this.editWorkshop.location);
    formData.append('startDate', this.editWorkshop.startDate);
    if (this.editWorkshop.endDate) {
      formData.append('endDate', this.editWorkshop.endDate);
    }
    formData.append('capacity', this.editWorkshop.capacity.toString());
    if (this.editWorkshop.image) {
      formData.append('image', this.editWorkshop.image);
    }

    const url = this.isEditingWorkshop
      ? `http://localhost:3000/api/workshops/${this.editWorkshop._id}`
      : 'http://localhost:3000/api/workshops';
    const method = this.isEditingWorkshop ? 'put' : 'post';

    this.http[method](url, formData, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.showWorkshopModal = false;
          this.fetchWorkshops();
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la ' + (this.isEditingWorkshop ? 'mise à jour' : 'création') + ' du workshop';
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      });
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
          if (error.status === 401 || error.status === 403) {
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

  deleteWorkshop(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workshop ?')) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/api/workshops/${id}`, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.fetchWorkshops();
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Erreur lors de la suppression du workshop';
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

    this.http.patch(`http://localhost:3000/organisateur/verifyOrganisateur/${id}`, {}, { headers })
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

  updateEnrollmentStatus(id: string) {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:3000/api/enrollments/${id}`, {}, { headers })
      .subscribe({
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
        }
      });
  }

  deleteEnrollment(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/api/enrollments/${id}`, { headers })
      .subscribe({
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
        }
      });
  }
}
