import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-workshops',
  templateUrl: './workshop.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
})
export class WorkshopsComponent implements OnInit {
  workshops: any[] = [];
  isLoading = false;
  error = '';
  success = '';
  showWorkshopModal = false;
  isEditingWorkshop = false;
  editWorkshop: any = {};
  selectedFile: File | null = null;
  showQuizModal = false;
  selectedWorkshop: any = null;
  quiz: any = { title: '', questions: [], passingScore: 70, duration: 30, _id: null };
  newQuestion: any = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  };
  hasInsufficientOptions = true;
  @ViewChild('quizForm') quizForm: NgForm | undefined;

  constructor(private http: HttpClient, private router: Router) {}

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
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  openCreateWorkshopModal() {
    this.isEditingWorkshop = false;
    this.editWorkshop = { startDate: '', endDate: '', price: 0, capacity: 1 };
    this.selectedFile = null;
    this.showWorkshopModal = true;
  }

  openEditWorkshopModal(workshop: any) {
    this.isEditingWorkshop = true;
    this.editWorkshop = {
      ...workshop,
      startDate: new Date(workshop.startDate).toISOString().split('T')[0],
      endDate: workshop.endDate ? new Date(workshop.endDate).toISOString().split('T')[0] : '',
    };
    this.selectedFile = null;
    this.showWorkshopModal = true;
  }

  closeWorkshopModal() {
    this.showWorkshopModal = false;
    this.editWorkshop = {};
    this.selectedFile = null;
    this.error = '';
    this.success = '';
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  saveWorkshop(form: NgForm) {
    if (form.invalid) return;
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    for (const key in this.editWorkshop) {
      if (this.editWorkshop[key] !== null && this.editWorkshop[key] !== '') {
        formData.append(key, this.editWorkshop[key]);
      }
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    const url = this.isEditingWorkshop
      ? `http://localhost:3000/api/workshops/${this.editWorkshop._id}`
      : 'http://localhost:3000/api/workshops';
    const method = this.isEditingWorkshop ? 'put' : 'post';
    this.http[method](url, formData, { headers }).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = this.isEditingWorkshop ? 'Workshop mis à jour avec succès' : 'Workshop créé avec succès';
        this.fetchWorkshops();
        this.closeWorkshopModal();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de l\'enregistrement du workshop';
      },
    });
  }

  deleteWorkshop(id: string) {
    if (!confirm('Voulez-vous vraiment supprimer ce workshop ?')) return;
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.delete(`http://localhost:3000/api/workshops/${id}`, { headers }).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = 'Workshop supprimé avec succès';
        this.fetchWorkshops();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la suppression du workshop';
      },
    });
  }

  openQuizModal(workshop: any) {
    this.selectedWorkshop = workshop;
    this.quiz = { title: `Quiz pour ${workshop.title}`, questions: [], passingScore: 70, duration: 30, _id: null };
    this.newQuestion = { question: '', options: ['', '', '', ''], correctAnswer: 0 };
    this.error = '';
    this.success = '';
    this.hasInsufficientOptions = true;
    this.showQuizModal = true;
    this.fetchQuiz(workshop._id);
  }

  closeQuizModal() {
    this.showQuizModal = false;
    this.selectedWorkshop = null;
    this.quiz = { title: '', questions: [], passingScore: 70, duration: 30, _id: null };
    this.newQuestion = { question: '', options: ['', '', '', ''], correctAnswer: 0 };
    this.error = '';
    this.success = '';
    this.hasInsufficientOptions = true;
  }

  fetchQuiz(workshopId: string) {
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`http://localhost:3000/api/quizzes/${workshopId}`, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.quiz = {
            ...response.data,
            _id: response.data._id || null,
            questions: response.data.questions.filter((q: any) =>
              q.question?.trim() && q.options?.length >= 2 && Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length
            ),
          };
        } else {
          this.quiz.questions = [];
          this.quiz._id = null;
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status !== 404) {
          this.error = error.error?.error || 'Erreur lors de la récupération du quiz';
        }
        this.quiz.questions = [];
        this.quiz._id = null;
      },
    });
  }

  addQuizQuestion(form: NgForm) {
    if (form.invalid || this.hasInsufficientOptions || !this.newQuestion.question.trim()) {
      this.error = 'Veuillez fournir une question valide et au moins 2 options non vides';
      return;
    }
    const validOptions = this.newQuestion.options.filter((opt: string) => opt.trim());
    if (validOptions.length < 2 || this.newQuestion.correctAnswer >= validOptions.length) {
      this.error = 'Chaque question doit avoir un texte, au moins 2 options, et un index de bonne réponse valide';
      return;
    }
    this.isLoading = true;
    this.error = '';
    this.success = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const questionData = {
      question: this.newQuestion.question.trim(),
      options: validOptions,
      correctAnswer: Number(this.newQuestion.correctAnswer),
    };
    const updatedQuestions = [...this.quiz.questions, questionData].filter((q: any) =>
      q.question?.trim() && q.options?.length >= 2 && Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length
    );
    const quizData = {
      workshopId: this.selectedWorkshop._id,
      title: this.quiz.title.trim() || `Quiz pour ${this.selectedWorkshop.title}`,
      questions: updatedQuestions,
      passingScore: Number(this.quiz.passingScore) || 70,
      duration: Number(this.quiz.duration) || 30,
    };
    const url = this.quiz._id ? `http://localhost:3000/api/quizzes/${this.selectedWorkshop._id}` : 'http://localhost:3000/api/quizzes';
    const method = this.quiz._id ? 'put' : 'post';
    this.http[method](url, quizData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = 'Question ajoutée avec succès';
        this.quiz = {
          ...response.data,
          _id: response.data._id || null,
          questions: response.data.questions.filter((q: any) =>
            q.question?.trim() && q.options?.length >= 2 && Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length
          ),
        };
        this.newQuestion = { question: '', options: ['', '', '', ''], correctAnswer: 0 };
        this.hasInsufficientOptions = true;
        form.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de l\'ajout de la question';
      },
    });
  }

  deleteQuizQuestion(index: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette question ?')) return;
    this.isLoading = true;
    this.error = '';
    this.success = '';
    this.quiz.questions.splice(index, 1);
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const quizData = {
      workshopId: this.selectedWorkshop._id,
      title: this.quiz.title || `Quiz pour ${this.selectedWorkshop.title}`,
      questions: this.quiz.questions,
      passingScore: Number(this.quiz.passingScore) || 70,
      duration: Number(this.quiz.duration) || 30,
    };
    this.http.put(`http://localhost:3000/api/quizzes/${this.selectedWorkshop._id}`, quizData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = 'Question supprimée avec succès';
        this.quiz = {
          ...response.data,
          _id: response.data._id || null,
          questions: response.data.questions.filter((q: any) =>
            q.question?.trim() && q.options?.length >= 2 && Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length
          ),
        };
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.error || 'Erreur lors de la suppression de la question';
        this.fetchQuiz(this.selectedWorkshop._id);
      },
    });
  }

  addOption() {
    this.newQuestion.options.push('');
    this.validateOptions();
  }

  removeOption(index: number) {
    this.newQuestion.options.splice(index, 1);
    if (this.newQuestion.correctAnswer >= this.newQuestion.options.length) {
      this.newQuestion.correctAnswer = Math.max(0, this.newQuestion.options.length - 1);
    }
    this.validateOptions();
  }

  validateOptions() {
    this.hasInsufficientOptions = this.newQuestion.options.filter((opt: string) => opt.trim()).length < 2;
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  resetQuizForm(form: NgForm) {
    this.newQuestion = { question: '', options: ['', '', '', ''], correctAnswer: 0 };
    this.hasInsufficientOptions = true;
    form.resetForm();
    this.clearMessages();
  }

  isSubmitDisabled(): boolean {
    return (
      !this.quizForm?.valid ||
      this.isLoading ||
      this.hasInsufficientOptions ||
      !this.newQuestion.question.trim() ||
      this.newQuestion.options.filter((opt: string) => opt.trim()).length < 2 ||
      this.newQuestion.correctAnswer >= this.newQuestion.options.filter((opt: string) => opt.trim()).length
    );
  }

  trackByFn(index: number) {
    return index;
  }
}
