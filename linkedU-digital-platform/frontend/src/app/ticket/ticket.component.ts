import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { TicketService } from '../core/services/ticket.service';
import {
  Ticket,
  CreateTicketDTO,
  AcceptTicketDTO,
  RejectTicketDTO,
  TicketStatus
} from '../shared/models/models';

type ViewMode = 'list' | 'create';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent implements OnInit {

  private readonly platformId = inject(PLATFORM_ID);

  // ── Auth ──
  userRole = '';
  userId = 0;

  // ── View ──
  viewMode: ViewMode = 'list';

  // ── Tickets ──
  tickets: Ticket[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // ── Create Form (Student) ──
  createForm: CreateTicketDTO = {
    object: '',
    description: '',
    availabilityDateTime: ''
  };
  isSubmitting = false;

  // ── Accept Form (Agent) ──
  acceptForm: AcceptTicketDTO = { googleMeetLink: '' };
  acceptingTicketId: number | null = null;

  // ── Reject Form (Agent) ──
  rejectForm: RejectTicketDTO = { reason: '' };
  rejectingTicketId: number | null = null;

  // ── Response Form (Agent) ──
  responseText = '';
  respondingTicketId: number | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly ticketService: TicketService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.userRole = this.authService.getUserRole()?.toUpperCase() || '';
    this.userId = Number(this.authService.getUserId());
    this.loadTickets();
  }

  // ── Load ──
  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const request = this.userRole === 'AGENT'
      ? this.ticketService.getMyTicketsAsAgent()
      : this.ticketService.getMyTicketsAsStudent();

    request.subscribe({
      next: (data) => { this.tickets = data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.errorMessage = 'Échec du chargement des tickets.'; }
    });
  }

  // ── Student: Create ──
  showCreate(): void {
    this.viewMode = 'create';
    this.createForm = { object: '', description: '', availabilityDateTime: '' };
    this.errorMessage = '';
    this.successMessage = '';
  }

  showList(): void {
    this.viewMode = 'list';
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitTicket(): void {
    if (!this.createForm.object || !this.createForm.description || !this.createForm.availabilityDateTime) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.ticketService.createTicket(this.createForm).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Ticket envoyé ! Votre agent sera notifié.';
        this.isSubmitting = false;
        this.viewMode = 'list';
        this.loadTickets();
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Échec de l\'envoi du ticket.';
        this.isSubmitting = false;
      }
    });
  }

  // ── Agent: Accept ──
  startAccept(ticketId: number): void {
    this.acceptingTicketId = ticketId;
    this.acceptForm = { googleMeetLink: '' };
    this.rejectingTicketId = null;
    this.respondingTicketId = null;
  }

  submitAccept(ticketId: number): void {
    if (!this.acceptForm.googleMeetLink) {
      this.errorMessage = 'Veuillez fournir un lien Google Meet.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.ticketService.acceptTicket(ticketId, this.acceptForm).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Ticket accepté ! L\'étudiant a été notifié.';
        this.isSubmitting = false;
        this.acceptingTicketId = null;
        this.loadTickets();
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Échec de l\'acceptation du ticket.';
        this.isSubmitting = false;
      }
    });
  }

  // ── Agent: Reject ──
  startReject(ticketId: number): void {
    this.rejectingTicketId = ticketId;
    this.rejectForm = { reason: '' };
    this.acceptingTicketId = null;
    this.respondingTicketId = null;
  }

  submitReject(ticketId: number): void {
    if (!this.rejectForm.reason) {
      this.errorMessage = 'Veuillez fournir une raison de rejet.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.ticketService.rejectTicket(ticketId, this.rejectForm).subscribe({
      next: () => {
        this.successMessage = 'Ticket rejeté.';
        this.isSubmitting = false;
        this.rejectingTicketId = null;
        this.loadTickets();
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Échec du rejet du ticket.';
        this.isSubmitting = false;
      }
    });
  }

  // ── Agent: Response ──
  startResponse(ticketId: number): void {
    this.respondingTicketId = ticketId;
    this.responseText = '';
    this.acceptingTicketId = null;
    this.rejectingTicketId = null;
  }

  submitResponse(ticketId: number): void {
    if (!this.responseText.trim()) {
      this.errorMessage = 'Veuillez écrire une réponse.';
      return;
    }
    this.isSubmitting = true;

    this.ticketService.addResponse(ticketId, this.responseText).subscribe({
      next: () => {
        this.successMessage = 'Réponse envoyée !';
        this.isSubmitting = false;
        this.respondingTicketId = null;
        this.responseText = '';
      },
      error: () => {
        this.errorMessage = 'Échec de l\'envoi de la réponse.';
        this.isSubmitting = false;
      }
    });
  }

  cancelAction(): void {
    this.acceptingTicketId = null;
    this.rejectingTicketId = null;
    this.respondingTicketId = null;
    this.errorMessage = '';
  }

  // ── Helpers ──
  getStatusClass(status: TicketStatus): string {
    if (status === 'ACCEPTED') return 'status-accepted';
    if (status === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  }

  getStatusLabel(status: TicketStatus): string {
    if (status === 'ACCEPTED') return '✅ Accepté';
    if (status === 'REJECTED') return '❌ Rejeté';
    return '⏳ En attente';
  }

  formatDateTime(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString([], {
      month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  //-- Status Icons ──
  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return 'fa-regular fa-clock';
      case 'ACCEPTED': return 'fa-solid fa-check-circle';
      case 'REJECTED': return 'fa-solid fa-times-circle';
      case 'RESOLVED': return 'fa-solid fa-check-double';
      default: return 'fa-regular fa-circle-question';
    }
  }
}