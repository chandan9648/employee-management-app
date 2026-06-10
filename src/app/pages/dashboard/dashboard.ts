import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EmployeeModel } from '../../models/Employee.model';
import { Master } from '../../services/master';
import { DesignationStateService } from '../../services/designation-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private masterService = inject(Master);
  private designationState = inject(DesignationStateService);

  employees = signal<EmployeeModel[]>([]);
  departments = signal<any[]>([]);
  loggedUser = signal<EmployeeModel | null>(null);

  // Live from shared service — updates instantly when Designation page changes anything
  totalDesignations = this.designationState.count;

  totalEmployees = computed(() => this.employees().length);
  totalDepartments = computed(() => this.departments().length);

  recentEmployees = computed(() =>
    [...this.employees()]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 5)
  );

  roleDistribution = computed(() => {
    const emps = this.employees();
    if (!emps.length) return [];
    const roles: Record<string, number> = {};
    emps.forEach(e => { roles[e.role || 'Unknown'] = (roles[e.role || 'Unknown'] || 0) + 1; });
    return Object.entries(roles).map(([role, count]) => ({
      role,
      count,
      pct: Math.round((count / emps.length) * 100)
    }));
  });

  ngOnInit() {
    const localData = localStorage.getItem('empLoginUser');
    if (localData) this.loggedUser.set(JSON.parse(localData));
    this.loadEmployees();
    this.loadDepartments();
  }

  private loadEmployees() {
    const raw = localStorage.getItem('employees');
    if (raw) {
      try { this.employees.set(JSON.parse(raw)); } catch { this.employees.set([]); }
    }
  }

  private loadDepartments() {
    this.masterService.getAllDept().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data ?? res?.result ?? res?.items ?? []);
        this.departments.set(data);
      },
      error: () => this.departments.set([])
    });
  }



  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }
}
