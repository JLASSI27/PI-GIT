// my-workshops.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  _id: string;
  title: string;
  workshopId: string;
  questions: QuizQuestion[];
  passingScore: number;
  duration: number;
}

@Component({
  selector: 'app-my-workshops',
  templateUrl: './my-workshops.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
})
export class MyWorkshopsComponent implements OnInit {
  workshops: any[] = [];
  tasks: any[] = [];
  quizzes: Quiz[] = [];
  progress: any[] = [];
  selectedWorkshop: string | null = null;
  currentTaskIndex: number = 0;
  currentQuiz: Quiz | null = null;
  answers: { [key: string]: string } = {};
  isLoading = false;
  error = '';
  success = '';
  showQuizModal = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchEnrolledWorkshops();
    this.fetchProgress();
  }

  fetchEnrolledWorkshops() {
    this.isLoading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.error = 'No authentication token found. Please log in.';
      console.error('No token found in localStorage');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost:3000/api/enrollments/my-enrollments', { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.workshops = response.data.filter((e: any) => e.status === 'inscrit') || [];
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la récupération des workshops';
        console.error('Fetch enrollments error:', error);
        if (error.status === 401 || error.status === 400 || error.status ===403 ) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  fetchProgress() {
    this.isLoading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.error = 'No authentication token found. Please log in.';
      console.error('No token found in localStorage');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost:3000/api/progress/my-progress', { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.progress = response.data || [];
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la récupération de la progression';
        console.error('Fetch progress error:', error);
        if (error.status === 401 || error.status === 400 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  selectWorkshop(workshopId: string) {
    this.selectedWorkshop = workshopId;
    this.currentTaskIndex = this.getLastTaskIndex(workshopId);
    this.fetchTasks(workshopId);
  }

  fetchTasks(workshopId: string) {
    this.isLoading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.error = 'No authentication token found. Please log in.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`http://localhost:3000/api/tasks/workshop/${workshopId}/user`, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.tasks = response.data || [];
        if (this.currentTaskIndex >= this.tasks.length) {
          this.fetchQuizzes(workshopId);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la récupération des tâches';
        console.error('Fetch tasks error:', error);
        if (error.status === 401 || error.status === 400 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  fetchQuizzes(workshopId: string) {
    this.isLoading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.error = 'No authentication token found. Please log in.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`http://localhost:3000/api/quizzes/workshop/${workshopId}`, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.quizzes = response.data ? [response.data] : [];
        if (this.quizzes.length > 0) {
          this.startQuiz(this.quizzes[0]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la récupération des quizzes';
        console.error('Fetch quizzes error:', error);
        if (error.status === 401 || error.status === 400 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  getLastTaskIndex(workshopId: string): number {
    const progress = this.progress.find(p => p.workshop === workshopId);
    return progress ? progress.lastTaskIndex : 0;
  }

  markTaskAsRead() {
    if (this.currentTaskIndex < this.tasks.length - 1) {
      this.currentTaskIndex++;
      this.saveProgress();
    } else {
      this.fetchQuizzes(this.selectedWorkshop!);
    }
  }

  saveProgress() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'No authentication token found. Please log in.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const progressData = {
      workshopId: this.selectedWorkshop,
      lastTaskIndex: this.currentTaskIndex,
    };
    this.http.post('http://localhost:3000/api/progress', progressData, { headers }).subscribe({
      next: () => {
        this.progress = this.progress.filter(p => p.workshop !== this.selectedWorkshop);
        this.progress.push({ ...progressData, workshop: this.selectedWorkshop });
      },
      error: (error) => {
        console.error('Save progress error:', error);
        if (error.status === 401 || error.status === 400 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  startQuiz(quiz: Quiz) {
    this.currentQuiz = quiz;
    this.answers = {};
    this.showQuizModal = true;
  }

  submitQuiz() {
    this.isLoading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.error = 'No authentication token found. Please log in.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const submissionData = {
      quizId: this.currentQuiz!._id,
      answers: Object.keys(this.answers).reduce((acc, key) => {
        const question = this.currentQuiz!.questions.find((q: QuizQuestion) => q._id === key);
        if (question) {
          acc[key] = question.options.indexOf(this.answers[key]).toString();
        }
        return acc;
      }, {} as { [key: string]: string }),
    };
    this.http.post('http://localhost:3000/api/quizzes/submit', submissionData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = `Quiz soumis avec succès. Score: ${response.data.percentage}% (${response.data.passed ? 'Réussi' : 'Échoué'})`;
        this.showQuizModal = false;
        this.currentQuiz = null;
        this.answers = {};
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la soumission du quiz';
        console.error('Submit quiz error:', error);
        if (error.status === 401 || error.status === 400 ) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  closeQuizModal() {
    this.showQuizModal = false;
    this.saveProgress();
  }

  trackByFn(index: number) {
    return index;
  }
}
