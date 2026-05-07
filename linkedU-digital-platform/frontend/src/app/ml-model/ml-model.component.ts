import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MlModelService } from '../core/services/ml-model.service';
import { AuthService } from '../core/services/auth.service';
import { AgentService } from '../core/services/agent.service';
import { Router } from '@angular/router';
import { AssignedStudent } from '../shared/models/models';

@Component({
  selector: 'app-ml-model',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ml-model.html',
  styleUrl: './ml-model.component.css'
})
export class MlModelComponent implements OnInit {

  // ── FORM ──
  predictionForm = {
    country: '',
    major: '',
    language: '',
    moyenne: null as number | null,
    tuitionTier: null as number | null,
  };

  selectedStudentId: number | null = null;

  // ── UI STATE ──
  isLoading = false;
  error: string | null = null;
  predictionResult: string | null = null;
  recommendations: any[] = [];

  // ── DATA ──
  students: AssignedStudent[] = [];

  countries = ['France', 'Germany', 'Italy', 'Morocco', 'China', 'UK', 'Russia', 'Unknown'];

  majors = [
    'engineering', 'business', 'technology', 'it_engineering',
    'science_technology', 'management', 'health_sciences'
  ];

  languagesList = ['french', 'english', 'bilingual'];
  tuitionTiersList = [1, 2, 3];
  moyennesList = [10, 12, 14, 16];

  constructor(
    private mlModelService: MlModelService,
    private agentService: AgentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  // ── LOAD STUDENTS ──
  private loadStudents(): void {
    const agentId = Number(this.authService.getUserId());

    // 🛑 SSR / invalid user protection
    if (!agentId || agentId <= 0) return;

    this.agentService.getMyStudents(agentId).subscribe({
      next: (data) => this.students = data,
      error: () => this.students = []
    });
  }

  // ── AUTO FILL FROM STUDENT ──
  onStudentChange(): void {
    if (!this.selectedStudentId) return;

    this.agentService.getStudentProfile(this.selectedStudentId).subscribe({
      next: (profile: any) => {
        if (profile?.speciality) {
          this.predictionForm.major = profile.speciality.toLowerCase();
        }
      },
      error: () => {}
    });
  }

  // ── ML PREDICTION ──
  onSubmit(): void {
    this.isLoading = true;
    this.error = null;
    this.predictionResult = null;
    this.recommendations = [];

    const form = this.predictionForm;

    // validation
    if (
      !form.country ||
      !form.major ||
      !form.language ||
      form.moyenne === null ||
      form.tuitionTier === null
    ) {
      this.error = 'Please fill all fields';
      this.isLoading = false;
      return;
    }

    const payload = {
      country: form.country,
      major: form.major,
      language: form.language,
      moyenne: Number(form.moyenne),
      tuition_tier: Number(form.tuitionTier)
    };

    this.mlModelService.predictAdmission(payload).subscribe({
      next: (res) => {
        this.recommendations = res.recommendations || [];

        this.predictionResult =
          this.recommendations.length > 0
            ? `${this.recommendations.length} universités trouvées`
            : 'Aucune recommandation trouvée';

        this.isLoading = false;
      },
      error: () => {
        this.error = 'Prediction failed';
        this.isLoading = false;
      }
    });
  }

  // ── LOGOUT ──
  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}