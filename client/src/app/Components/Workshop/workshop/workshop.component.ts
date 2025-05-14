import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
})
export class WorkshopsComponent implements OnInit {
  workshops: any[] = [];
  isLoading = false;
  error = '';
  showWorkshopModal = false;
  isEditingWorkshop = false;
  editWorkshop: any = {
    title: '',
    description: '',
    category: '',
    price: null,
    location: '',
    startDate: '',
    endDate: '',
    capacity: null,
    image: null,
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchWorkshops();
  }

  fetchWorkshops() {
    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/api/workshops', { headers }).subscribe({
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
      },
    });
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
      image: null,
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
      image: null,
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
      image: null,
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

    this.http[method](url, formData, { headers }).subscribe({
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
      },
    });
  }

  deleteWorkshop(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workshop ?')) return;

    this.isLoading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/api/workshops/${id}`, { headers }).subscribe({
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
      },
    });
  }
}
