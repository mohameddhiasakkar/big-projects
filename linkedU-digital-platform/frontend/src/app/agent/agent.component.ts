import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { AgentService } from '../core/services/agent.service';
import { ChatService } from '../core/services/chat.service';
import {
  AssignedStudent,
  DocumentResponseDTO,
  Progress,
  ProgressStage,
  AgentProfileResponse
} from '../shared/models/models';

type AgentView = 'students' | 'student-detail';
type DetailTab = 'profile' | 'documents' | 'progress';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agent.component.html',
  styleUrl: './agent.component.css'
})
export class AgentComponent implements OnInit, OnDestroy {

  // ── Auth ──
  agentId = 0;
  agentName = '';
  unreadMessagesCount = 0;

  // ── Agent's own profile ──
  agentProfile: AgentProfileResponse | null = null;
  isLoadingAgentProfile = true;

  // ── Navigation ──
  currentView: AgentView = 'students';
  activeTab: DetailTab = 'profile';

  // ── Students List ──
  students: AssignedStudent[] = [];
  isLoadingStudents = true;
  studentsError = '';

  // ── Selected Student ──
  selectedStudent: AssignedStudent | null = null;
  studentProfile: any = null;
  isLoadingProfile = false;

  // ── Documents ──
  documents: DocumentResponseDTO[] = [];
  isLoadingDocs = false;
  isVerifying = false;
  verifySuccess = '';
  verifyError = '';

  // ── Progress ──
  progressList: Progress[] = [];
  isLoadingProgress = false;
  isUpdatingProgress = false;
  progressSuccess = '';
  progressError = '';

  // Private properties
  private intervalId: any = null;
  private isBrowser: boolean;
  private isServer: boolean;

  // Updated allStages with comprehensive stages
  allStages: ProgressStage[] = [
    'ORIENTATION',
    'DOSSIER_PREPARATION',
    'DOCUMENT_COLLECTION',
    'LANGUAGE_TESTS',
    'UNIVERSITY_SELECTION',
    'APPLICATION_SUBMISSION',
    'INTERVIEW_PREPARATION',
    'ACCEPTANCE_LETTER',
    'VISA_APPLICATION',
    'ACCOMMODATION',
    'TRAVEL_PLANNING',
    'PRE_DEPARTURE',
    'ARRIVAL_SETTLEMENT'
  ];

  // Updated stageLabels with all stages
  stageLabels: Record<ProgressStage, string> = {
    ORIENTATION: 'Orientation & Planification',
    DOSSIER_PREPARATION: 'Préparation du dossier',
    DOCUMENT_COLLECTION: 'Collecte de documents',
    LANGUAGE_TESTS: 'Tests de langue (IELTS/TOEFL)',
    UNIVERSITY_SELECTION: 'Sélection d\'université',
    APPLICATION_SUBMISSION: 'Soumission de la candidature',
    INTERVIEW_PREPARATION: 'Préparation à l\'entretien',
    ACCEPTANCE_LETTER: 'Lettre d\'acceptation',
    VISA_APPLICATION: 'Demande de visa',
    ACCOMMODATION: 'Logement',
    TRAVEL_PLANNING: 'Planification du voyage',
    PRE_DEPARTURE: 'Préparation au départ',
    ARRIVAL_SETTLEMENT: 'Arrivée & Installation'
  };

  // Updated stageIcons with FontAwesome classes
  stageIcons: Record<ProgressStage, string> = {
    ORIENTATION: 'fa-solid fa-compass',
    DOSSIER_PREPARATION: 'fa-solid fa-folder-open',
    DOCUMENT_COLLECTION: 'fa-solid fa-file-alt',
    LANGUAGE_TESTS: 'fa-solid fa-language',
    UNIVERSITY_SELECTION: 'fa-solid fa-university',
    APPLICATION_SUBMISSION: 'fa-solid fa-paper-plane',
    INTERVIEW_PREPARATION: 'fa-solid fa-chalkboard-user',
    ACCEPTANCE_LETTER: 'fa-solid fa-envelope-open-text',
    VISA_APPLICATION: 'fa-solid fa-passport',
    ACCOMMODATION: 'fa-solid fa-building',
    TRAVEL_PLANNING: 'fa-solid fa-plane',
    PRE_DEPARTURE: 'fa-solid fa-suitcase',
    ARRIVAL_SETTLEMENT: 'fa-solid fa-home'
  };

  constructor(
    private readonly authService: AuthService,
    private readonly agentService: AgentService,
    private readonly chatService: ChatService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isServer = isPlatformServer(this.platformId);
  }

  ngOnInit(): void {
    // Only run initialization in browser
    if (this.isBrowser) {
      this.initializeInBrowser();
    } else {
      // On server, just set basic data without API calls
      this.initializeOnServer();
    }
  }

  ngOnDestroy(): void {
    // Clean up interval to prevent memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private initializeInBrowser(): void {
    console.log('Initializing AgentComponent in browser');
    
    this.agentId = Number(this.authService.getUserId());
    
    // Only load data if we have a valid agent ID
    if (this.agentId && this.agentId !== 0) {
      this.loadAgentProfile();
      this.loadStudents();
      this.loadUnreadMessagesCount();
      
      // Refresh unread count every 30 seconds
      this.intervalId = setInterval(() => {
        this.loadUnreadMessagesCount();
      }, 30000);
    } else {
      console.warn('No valid agent ID found');
      this.isLoadingAgentProfile = false;
      this.isLoadingStudents = false;
    }
  }

  private initializeOnServer(): void {
    console.log('Initializing AgentComponent on server (prerendering)');
    // Set minimal data for server-side rendering
    this.isLoadingAgentProfile = false;
    this.isLoadingStudents = false;
    this.studentsError = '';
    this.students = [];
    this.agentProfile = null;
    
    // Don't make any API calls during prerendering
    // Just show a loading state that will be replaced on client
  }

  // ── Unread Messages ──
  loadUnreadMessagesCount(): void {
    if (!this.agentId || this.agentId === 0 || !this.isBrowser) {
      this.unreadMessagesCount = 0;
      return;
    }
    
    this.chatService.getUnreadMessages(this.agentId).subscribe({
      next: (messages) => {
        this.unreadMessagesCount = messages.length;
      },
      error: () => {
        this.unreadMessagesCount = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  // ── Agent's own profile ──
  loadAgentProfile(): void {
    if (!this.isBrowser || !this.agentId || this.agentId === 0) {
      this.isLoadingAgentProfile = false;
      return;
    }
    
    this.isLoadingAgentProfile = true;
    this.agentService.getMyAgentProfile().subscribe({
      next: (data) => {
        this.agentProfile = data;
        this.isLoadingAgentProfile = false;
      },
      error: () => {
        this.isLoadingAgentProfile = false;
      }
    });
  }

  getAgentAvatarUrl(): string {
    if (!this.agentProfile?.avatar) return '';
    if (this.agentProfile.avatar.startsWith('http')) return this.agentProfile.avatar;
    return 'http://localhost:8080' + this.agentProfile.avatar;
  }

  getAgentInitials(): string {
    const f = this.agentProfile?.user?.firstName?.charAt(0) || '';
    const l = this.agentProfile?.user?.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '??';
  }

  getAgentStatusClass(): string {
    switch (this.agentProfile?.onlineStatus) {
      case 'ONLINE':  return 'status-online';
      case 'AWAY':    return 'status-away';
      case 'OFFLINE': return 'status-offline';
      default:        return 'status-offline';
    }
  }

  // ── Students ──
  loadStudents(): void {
    if (!this.isBrowser || !this.agentId || this.agentId === 0) {
      this.isLoadingStudents = false;
      this.studentsError = 'Veuillez vous connecter pour voir les étudiants';
      return;
    }
    
    this.isLoadingStudents = true;
    this.agentService.getMyStudents(this.agentId).subscribe({
      next: (data) => {
        this.students = data;
        this.isLoadingStudents = false;
      },
      error: () => {
        this.studentsError = 'Échec du chargement des étudiants.';
        this.isLoadingStudents = false;
      }
    });
  }

  selectStudent(student: AssignedStudent): void {
    this.selectedStudent = student;
    this.currentView = 'student-detail';
    this.activeTab = 'profile';
    this.studentProfile = null;
    this.documents = [];
    this.progressList = [];
    this.verifySuccess = '';
    this.verifyError = '';
    this.progressSuccess = '';
    this.progressError = '';
    this.loadStudentProfile(student.id);
  }

  backToStudents(): void {
    this.currentView = 'students';
    this.selectedStudent = null;
  }

  setTab(tab: DetailTab): void {
    this.activeTab = tab;
    if (tab === 'documents' && this.documents.length === 0) this.loadDocuments();
    if (tab === 'progress'  && this.progressList.length === 0) this.loadProgress();
  }

  // ── Student Profile ──
  loadStudentProfile(studentId: number): void {
    if (!this.isBrowser) return;
    
    this.isLoadingProfile = true;
    this.agentService.getStudentProfile(studentId).subscribe({
      next: (data) => {
        this.studentProfile = data;
        this.isLoadingProfile = false;
      },
      error: () => { this.isLoadingProfile = false; }
    });
  }

  getInitials(student: AssignedStudent): string {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  }

  getStudentAvatarUrl(): string {
    if (!this.studentProfile?.avatar) return '';
    if (this.studentProfile.avatar.startsWith('http')) return this.studentProfile.avatar;
    return 'http://localhost:8080' + this.studentProfile.avatar;
  }

  getStudentStatusClass(): string {
    switch (this.studentProfile?.onlineStatus) {
      case 'ONLINE':  return 'status-online';
      case 'AWAY':    return 'status-away';
      case 'OFFLINE': return 'status-offline';
      default:        return 'status-offline';
    }
  }

  parseLanguages(json: string): { name: string; level: string; rank: number }[] {
    try { return JSON.parse(json); } catch { return []; }
  }

  // ── Documents ──
  loadDocuments(): void {
    if (!this.selectedStudent || !this.isBrowser) return;
    this.isLoadingDocs = true;
    this.agentService.getStudentDocuments(this.selectedStudent.id).subscribe({
      next: (data) => { this.documents = data; this.isLoadingDocs = false; },
      error: () => { this.isLoadingDocs = false; }
    });
  }

  getDocumentByType(type: string): DocumentResponseDTO | undefined {
    return this.documents.find(d => d.documentType === type);
  }

  getDocumentDownloadUrl(filePath: string): string {
    const fileName = filePath.replace(/\\/g, '/').split('/').pop();
    return `http://localhost:8080/documents/${fileName}`;
  }

  verifyDocument(documentId: number, status: 'APPROVED' | 'REJECTED'): void {
    if (!this.isBrowser) return;
    
    this.isVerifying = true;
    this.verifySuccess = '';
    this.verifyError = '';
    this.agentService.verifyDocument(documentId, this.agentId, status).subscribe({
      next: () => {
        this.verifySuccess = `Document ${status === 'APPROVED' ? 'approuvé' : 'rejeté'} avec succès !`;
        this.isVerifying = false;
        this.loadDocuments();
      },
      error: (err: { error?: { error?: string } }) => {
        this.verifyError = err?.error?.error || 'Échec de la mise à jour du statut du document.';
        this.isVerifying = false;
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'APPROVED') return 'status-approved';
    if (status === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  }

  getStatusLabel(status: string): string {
    if (status === 'APPROVED') return 'Approuvé';
    if (status === 'REJECTED') return 'Rejeté';
    return 'En attente';
  }

  // ── Progress Helper Methods ──
  getStageIcon(stage: ProgressStage): string {
    return this.stageIcons[stage] || 'fa-solid fa-circle-info';
  }

  getStageLabel(stage: ProgressStage): string {
    return this.stageLabels[stage] || stage;
  }

  // ── Progress ──
  loadProgress(): void {
    if (!this.selectedStudent || !this.isBrowser) return;
    this.isLoadingProgress = true;
    this.agentService.getStudentProgress(this.selectedStudent.id).subscribe({
      next: (data) => { 
        this.progressList = data; 
        this.isLoadingProgress = false;
      },
      error: () => { 
        this.isLoadingProgress = false;
      }
    });
  }

  getStageProgress(stage: ProgressStage): Progress | undefined {
    return this.progressList.find(p => p.stage === stage);
  }

  getStageStatus(stage: ProgressStage): string {
    return this.getStageProgress(stage)?.status || 'NOT_STARTED';
  }

  getStageClass(stage: ProgressStage): string {
    const status = this.getStageStatus(stage);
    if (status === 'COMPLETED')  return 'stage-completed';
    if (status === 'IN_PROGRESS') return 'stage-inprogress';
    return 'stage-notstarted';
  }

  getCompletedCount(): number {
    return this.allStages.filter(s => this.getStageStatus(s) === 'COMPLETED').length;
  }

  updateStageStatus(stage: ProgressStage, newStatus: string): void {
    if (!this.selectedStudent || !this.isBrowser) return;
    
    this.isUpdatingProgress = true;
    this.progressSuccess = '';
    this.progressError = '';

    const existing = this.getStageProgress(stage);

    if (existing) {
      this.agentService.updateProgressStatus(existing.id, newStatus).subscribe({
        next: () => {
          this.progressSuccess = `${this.getStageLabel(stage)} mis à jour !`;
          this.isUpdatingProgress = false;
          this.loadProgress();
          setTimeout(() => this.progressSuccess = '', 3000);
        },
        error: () => {
          this.progressError = 'Échec de la mise à jour de la progression.';
          this.isUpdatingProgress = false;
        }
      });
    } else {
      this.agentService.createProgress(this.selectedStudent.id, stage).subscribe({
        next: (created) => {
          this.agentService.updateProgressStatus(created.id, newStatus).subscribe({
            next: () => {
              this.progressSuccess = `${this.getStageLabel(stage)} mis à jour !`;
              this.isUpdatingProgress = false;
              this.loadProgress();
              setTimeout(() => this.progressSuccess = '', 3000);
            },
            error: () => {
              this.progressError = 'Échec de la mise à jour de la progression.';
              this.isUpdatingProgress = false;
            }
          });
        },
        error: () => {
          this.progressError = 'Échec de la création de l\'étape de progression.';
          this.isUpdatingProgress = false;
        }
      });
    }
  }
}