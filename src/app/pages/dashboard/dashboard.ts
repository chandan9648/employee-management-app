import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EmployeeModel } from '../../models/Employee.model';
import { Master } from '../../services/master';

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

  employees = signal<EmployeeModel[]>([]);
  departments = signal<any[]>([]);
  designations = signal<any[]>([]);
  loggedUser = signal<EmployeeModel | null>(null);

  totalEmployees = computed(() => this.employees().length);
  totalDepartments = computed(() => this.departments().length);
  totalDesignations = computed(() => this.designations().length);
  recentEmployees = computed(() =>
    [...this.employees()]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 5)
  );

  // Chart bars: department employee count
  deptChartData = computed(() => {
    const emps = this.employees();
    const depts = this.departments();
    if (!depts.length) return [];

    const max = Math.max(...depts.map(d => emps.filter(e => e.designationId === d.departmentId).length), 1);
    return depts.slice(0, 6).map(d => {
      const count = emps.filter(e => e.designationId === d.departmentId).length;
      return { name: d.departmentName, count, pct: Math.max(8, Math.round((count / max) * 100)) };
    });
  });

  roleDistribution = computed(() => {
    const emps = this.employees();
    const roles: Record<string, number> = {};
    emps.forEach(e => { roles[e.role || 'Unknown'] = (roles[e.role || 'Unknown'] || 0) + 1; });
    return Object.entries(roles).map(([role, count]) => ({ role, count, pct: Math.round((count / emps.length) * 100) }));
  });

  ngOnInit() {
    const localData = localStorage.getItem('empLoginUser');
    if (localData) this.loggedUser.set(JSON.parse(localData));
    this.loadEmployees();
    this.loadDepartments();
    this.loadDesignations();
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

  // Seed designations that mirror the Designation page's local data
  private readonly seedDesignations = [
    { designationId: 1, departmentId: 2, designationName: 'Senior Software Engineer' },
    { designationId: 2, departmentId: 1, designationName: 'HR Specialist' },
    { designationId: 3, departmentId: 4, designationName: 'Operations Coordinator' },
  ];

  private loadDesignations() {
    this.masterService.getAllDesignation().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data ?? res?.result ?? res?.items ?? []);
        // If API returns valid data use it; otherwise fall back to local seed
        this.designations.set(Array.isArray(data) && data.length > 0 ? data : this.seedDesignations);
      },
      error: () => this.designations.set(this.seedDesignations)
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
