import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EmployeeModel } from '../../models/Employee.model';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7011/api';

  // Logged-in user
  loggedUser = signal<EmployeeModel | null>(null);

  // Profile form
  profileObj = signal<Partial<EmployeeModel>>({});

  // Password form
  passwordForm: PasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // UI state
  activeTab = signal<'profile' | 'password' | 'preferences'>('profile');
  profileSaving = signal(false);
  passwordSaving = signal(false);
  profileMsg = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  passwordMsg = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  showCurrentPwd = signal(false);
  showNewPwd = signal(false);
  showConfirmPwd = signal(false);

  // Preferences
  theme = signal<'light' | 'dark'>('light');
  emailNotifications = signal(true);

  ngOnInit() {
    const raw = localStorage.getItem('empLoginUser');
    if (raw) {
      const user: EmployeeModel = JSON.parse(raw);
      this.loggedUser.set(user);
      this.profileObj.set({
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        altContactNo: user.altContactNo,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        address: user.address,
      });
    }

    const savedTheme = localStorage.getItem('adminTheme') as 'light' | 'dark' | null;
    if (savedTheme) this.theme.set(savedTheme);

    const notif = localStorage.getItem('emailNotifications');
    if (notif !== null) this.emailNotifications.set(notif === 'true');
  }

  setTab(tab: 'profile' | 'password' | 'preferences') {
    this.activeTab.set(tab);
    this.profileMsg.set(null);
    this.passwordMsg.set(null);
  }

  getInitials(name: string): string {
    return (name || 'A').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  // ── Profile Update ──────────────────────────────────────────────────
  saveProfile() {
    const prof = this.profileObj();
    if (!prof.name?.trim()) {
      this.profileMsg.set({ type: 'error', text: 'Name is required.' });
      return;
    }
    if (!prof.email?.trim()) {
      this.profileMsg.set({ type: 'error', text: 'Email is required.' });
      return;
    }

    this.profileSaving.set(true);
    this.profileMsg.set(null);

    // Build updated employee object
    const current = this.loggedUser();
    const updated: EmployeeModel = { ...current!, ...prof } as EmployeeModel;

    this.http.put(`${this.apiUrl}/EmployeeMaster/UpdateEmployee`, updated).subscribe({
      next: () => {
        // Update localStorage
        localStorage.setItem('empLoginUser', JSON.stringify(updated));
        this.loggedUser.set(updated);
        this.profileMsg.set({ type: 'success', text: 'Profile updated successfully!' });
        this.profileSaving.set(false);
        this.clearMsg('profile');
      },
      error: (err: any) => {
        // If no backend, at least update localStorage
        localStorage.setItem('empLoginUser', JSON.stringify(updated));
        this.loggedUser.set(updated);
        this.profileMsg.set({ type: 'success', text: 'Profile saved locally (backend offline).' });
        this.profileSaving.set(false);
        this.clearMsg('profile');
      }
    });
  }

  // ── Password Change ─────────────────────────────────────────────────
  changePassword() {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!currentPassword) {
      this.passwordMsg.set({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      this.passwordMsg.set({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      this.passwordMsg.set({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword === currentPassword) {
      this.passwordMsg.set({ type: 'error', text: 'New password must differ from the current password.' });
      return;
    }

    this.passwordSaving.set(true);
    this.passwordMsg.set(null);

    const user = this.loggedUser();
    const payload = {
      employeeId: user?.employeeId,
      email: user?.email,
      currentPassword,
      newPassword,
    };

    this.http.post(`${this.apiUrl}/EmployeeMaster/ChangePassword`, payload).subscribe({
      next: () => {
        this.passwordMsg.set({ type: 'success', text: 'Password changed successfully!' });
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.passwordSaving.set(false);
        this.clearMsg('password');
      },
      error: (err: any) => {
        const msg = err?.error?.message || err?.error || 'Failed to change password. Check your current password.';
        this.passwordMsg.set({ type: 'error', text: msg });
        this.passwordSaving.set(false);
      }
    });
  }

  // ── Preferences ─────────────────────────────────────────────────────
  savePreferences() {
    localStorage.setItem('adminTheme', this.theme());
    localStorage.setItem('emailNotifications', String(this.emailNotifications()));
    this.profileMsg.set({ type: 'success', text: 'Preferences saved!' });
    this.clearMsg('profile');
  }

  setTheme(t: 'light' | 'dark') { this.theme.set(t); }

  // ── Helpers ─────────────────────────────────────────────────────────
  private clearMsg(which: 'profile' | 'password') {
    setTimeout(() => {
      if (which === 'profile') this.profileMsg.set(null);
      else this.passwordMsg.set(null);
    }, 4000);
  }

  passwordStrength(): { label: string; pct: number; color: string } {
    const p = this.passwordForm.newPassword;
    if (!p) return { label: '', pct: 0, color: '#e2e8f0' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map: Record<number, { label: string; pct: number; color: string }> = {
      0: { label: 'Too short', pct: 10, color: '#ef4444' },
      1: { label: 'Weak', pct: 25, color: '#f97316' },
      2: { label: 'Fair', pct: 50, color: '#eab308' },
      3: { label: 'Good', pct: 75, color: '#22c55e' },
      4: { label: 'Strong', pct: 100, color: '#10b981' },
    };
    return map[score] ?? map[0];
  }
}
