import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { User, UserRole } from '../../shared/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  agents: User[] = [];
  students: User[] = [];

  loading = false;
  errorMsg = '';
  successMsg = '';

  // Role assignment
  selectedRoleMap: { [userId: number]: UserRole } = {};
  assigningRole: number | null = null;

  // Agent assignment
  selectedAgentMap: { [studentId: number]: number } = {};
  assigningAgent: number | null = null;

  readonly roles: UserRole[] = ['ADMIN', 'USER', 'GUEST', 'STUDENT', 'AGENT', 'LANGUAGE_TEACHER'];

  private readonly roleChangeConfirmCode = 'admine123';

  roleConfirmOpen = false;
  roleConfirmUser: User | null = null;
  roleConfirmNewRole: UserRole | null = null;
  roleConfirmCodeInput = '';
  roleConfirmModalError = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.agents = users.filter(u => u.role === 'AGENT');
        this.students = users.filter(u => u.role === 'STUDENT');
        users.forEach(u => this.selectedRoleMap[u.id] = u.role);
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Échec du chargement des utilisateurs.';
        this.loading = false;
      }
    });
  }

  assignRole(user: User): void {
    const newRole = this.selectedRoleMap[user.id];
    if (!newRole || newRole === user.role) return;

    this.roleConfirmUser = user;
    this.roleConfirmNewRole = newRole;
    this.roleConfirmCodeInput = '';
    this.roleConfirmModalError = '';
    this.roleConfirmOpen = true;
  }

  cancelRoleConfirm(): void {
    if (this.roleConfirmUser) {
      this.selectedRoleMap[this.roleConfirmUser.id] = this.roleConfirmUser.role;
    }
    this.closeRoleConfirmModal();
  }

  onRoleConfirmBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('role-confirm-backdrop')) {
      this.cancelRoleConfirm();
    }
  }

  submitRoleConfirm(): void {
    if (!this.roleConfirmUser || !this.roleConfirmNewRole) return;

    if (this.roleConfirmCodeInput.trim() !== this.roleChangeConfirmCode) {
      this.roleConfirmModalError = 'Code de confirmation erroné. Le rôle n\'a pas été modifié.';
      return;
    }

    const user = this.roleConfirmUser;
    const newRole = this.roleConfirmNewRole;
    this.closeRoleConfirmModal();

    this.assigningRole = user.id;
    this.successMsg = '';
    this.errorMsg = '';

    this.adminService.assignRole(user.id, newRole).subscribe({
      next: () => {
        this.successMsg = `Rôle mis à jour en ${newRole} pour ${user.firstName} ${user.lastName}.`;
        this.assigningRole = null;
        this.loadUsers();
      },
      error: () => {
        this.errorMsg = 'Échec de l\'attribution du rôle.';
        this.assigningRole = null;
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
      this.successMsg = '';
      this.errorMsg = '';
      this.loading = true;
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.successMsg = `User ${user.firstName} ${user.lastName} deleted successfully.`;
          this.loading = false;
          this.loadUsers();
        },
        error: (err: any) => {
          console.error(`Delete failed (Status: ${err.status}):`, err.error || err.message);
          if (err.status === 404) {
            this.errorMsg = 'Utilisateur introuvable (404).';
          } else if (err.status === 403) {
            this.errorMsg = 'Accès refusé (403). Vérifiez vos permissions de sécurité.';
          } else if (err.status === 409) {
            this.errorMsg = 'Suppression impossible: cet utilisateur est lié à d\'autres données.';
          } else if (err.status === 500) {
            this.errorMsg = 'Erreur serveur (500). Cela est probablement dû à une contrainte de base de données (clés étrangères).';
          } else {
            this.errorMsg = `Échec de la suppression: ${err.message || 'Erreur inconnue'}`;
          }
          this.loading = false;
        }
      });
    }
  }

  private closeRoleConfirmModal(): void {
    this.roleConfirmOpen = false;
    this.roleConfirmUser = null;
    this.roleConfirmNewRole = null;
    this.roleConfirmCodeInput = '';
    this.roleConfirmModalError = '';
  }

  assignAgent(student: User): void {
    const agentId = this.selectedAgentMap[student.id];
    if (!agentId) return;
    this.assigningAgent = student.id;
    this.successMsg = '';
    this.errorMsg = '';

    this.adminService.assignAgentToStudent(student.id, agentId).subscribe({
      next: () => {
        this.successMsg = `Agent attribué à ${student.firstName} ${student.lastName}.`;
        this.assigningAgent = null;
      },
      error: () => {
        this.errorMsg = 'Échec de l\'attribution de l\'agent.';
        this.assigningAgent = null;
      }
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    const map: Record<UserRole, string> = {
      ADMIN: 'badge-admin',
      AGENT: 'badge-agent',
      STUDENT: 'badge-student',
      USER: 'badge-user',
      GUEST: 'badge-guest',
      LANGUAGE_TEACHER: 'badge-language-teacher'
    };
    return map[role] ?? 'badge-user';
  }

  getRoleIcon(role: UserRole): string {
    const icons: Record<UserRole, string> = {
      'ADMIN': 'fas fa-crown',
      'AGENT': 'fas fa-user-tie',
      'STUDENT': 'fas fa-user-graduate',
      'USER': 'fas fa-user',
      'GUEST': 'fas fa-user-slash',
      'LANGUAGE_TEACHER': 'fas fa-chalkboard-teacher'
    };
    return icons[role] ?? 'fas fa-user';
  }

  getSelectedRoleClass(role: UserRole): string {
    return `role-${role.toLowerCase()}`;
  }
}
