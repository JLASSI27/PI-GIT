import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
})
export class TasksComponent implements OnInit {
  workshops: any[] = [];
  tasks: any[] = [];
  isLoading = false;
  error = '';
  success = '';
  showTaskModal = false;
  isEditingTask = false;
  newTask: any = { workshopId: '', title: '', content: '' };
  editTask: any = { _id: '', workshopId: '', title: '', content: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchWorkshops();
  }

  fetchWorkshops() {
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost:3000/api/workshops', { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.workshops = response.data || [];
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la récupération des workshops';
        console.error('Fetch workshops error:', error);
      },
    });
  }

  openTaskModal() {
    this.isEditingTask = false;
    this.newTask = { workshopId: '', title: '', content: '' };
    this.error = '';
    this.success = '';
    this.showTaskModal = true;
  }

  openEditTaskModal(task: any) {
    this.isEditingTask = true;
    this.editTask = { _id: task._id, workshopId: task.workshop, title: task.title, content: task.content };
    this.error = '';
    this.success = '';
    this.showTaskModal = true;
  }

  closeTaskModal() {
    this.showTaskModal = false;
    this.newTask = { workshopId: '', title: '', content: '' };
    this.editTask = { _id: '', workshopId: '', title: '', content: '' };
    this.error = '';
    this.success = '';
  }

  createTask(form: NgForm) {
    if (form.invalid || !this.newTask.workshopId) {
      this.error = 'Veuillez remplir tous les champs requis';
      return;
    }
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const taskData = {
      workshopId: this.newTask.workshopId,
      title: this.newTask.title.trim(),
      content: this.newTask.content.trim(),
    };
    this.http.post(`http://localhost:3000/api/tasks/workshop/${this.newTask.workshopId}`, taskData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = 'Tâche créée avec succès';
        this.tasks.push(response.data);
        this.closeTaskModal();
        form.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la création de la tâche';
        console.error('Create task error:', error);
      },
    });
  }

  updateTask(form: NgForm) {
    if (form.invalid || !this.editTask.workshopId) {
      this.error = 'Veuillez remplir tous les champs requis';
      return;
    }
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const taskData = {
      workshopId: this.editTask.workshopId,
      title: this.editTask.title.trim(),
      content: this.editTask.content.trim(),
    };
    this.http.patch(`http://localhost:3000/api/tasks/${this.editTask._id}`, taskData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = 'Tâche mise à jour avec succès';
        const index = this.tasks.findIndex(t => t._id === this.editTask._id);
        if (index !== -1) {
          this.tasks[index] = response.data;
        }
        this.closeTaskModal();
        form.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la mise à jour de la tâche';
        console.error('Update task error:', error);
      },
    });
  }

  deleteTask(taskId: string) {
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.delete(`http://localhost:3000/api/tasks/${taskId}`, { headers }).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = 'Tâche supprimée avec succès';
        this.tasks = this.tasks.filter(t => t._id !== taskId);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la suppression de la tâche';
        console.error('Delete task error:', error);
      },
    });
  }

  fetchTasks(workshopId: string) {
    if (!workshopId) {
      this.tasks = [];
      return;
    }
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.error = 'Utilisateur non authentifié';
      return;
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`http://localhost:3000/api/tasks/workshop/${workshopId}`, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.tasks = response.data || [];
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la récupération des tâches';
        console.error('Fetch tasks error:', error);
      },
    });
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  trackByFn(index: number) {
    return index;
  }
}
