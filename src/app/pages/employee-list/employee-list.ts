import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';

import { EmployeeModel } from '../../models/Employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeList implements OnInit {
  readonly employees = signal<EmployeeModel[]>([]);

  readonly selectedEmployeeId = signal<number | null>(1);
  readonly searchTerm = signal('');
  readonly feedback = signal('Browse employee records, inspect details, or remove a row from the local list.');

  readonly filteredEmployees = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.employees();
    }

    return this.employees().filter((employee) => {
      const searchableText = [
        employee.name,
        employee.contactNo,
        employee.email,
        employee.city,
        employee.state,
        employee.role,
        String(employee.employeeId),
        String(employee.designationId),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    });
  });

  readonly selectedEmployee = computed(() => {
    const selectedId = this.selectedEmployeeId();
    return this.employees().find((employee) => employee.employeeId === selectedId) ?? null;
  });

  readonly totalEmployees = computed(() => this.employees().length);
  readonly visibleEmployees = computed(() => this.filteredEmployees().length);
  readonly selectedLocation = computed(() => {
    const employee = this.selectedEmployee();

    if (!employee) {
      return 'No employee selected';
    }

    return employee.state ? `${employee.city}, ${employee.state}` : employee.city;
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  updateSearch(term: string) {
    this.searchTerm.set(term);
  }

  selectEmployee(employee: EmployeeModel) {
    this.selectedEmployeeId.set(employee.employeeId);
    this.feedback.set(`Viewing ${employee.name}.`);
  }

  deleteEmployee(employee: EmployeeModel) {
    const shouldDelete = confirm(`Delete employee "${employee.name}"?`);

    if (!shouldDelete) {
      return;
    }

    this.employees.update((items) => items.filter((item) => item.employeeId !== employee.employeeId));
    this.persistEmployees();

    if (this.selectedEmployeeId() === employee.employeeId) {
      this.selectedEmployeeId.set(this.employees()[0]?.employeeId ?? null);
    }

    this.feedback.set('Employee removed from the list.');
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  trackByEmployeeId(_: number, item: EmployeeModel) {
    return item.employeeId;
  }

  private loadEmployees() {
    const rawEmployees = localStorage.getItem('employees');

    if (!rawEmployees) {
      this.employees.set(this.getSeedEmployees());
      this.persistEmployees();
      this.selectedEmployeeId.set(this.employees()[0]?.employeeId ?? null);
      return;
    }

    try {
      const parsedEmployees = JSON.parse(rawEmployees) as EmployeeModel[];
      this.employees.set(Array.isArray(parsedEmployees) ? parsedEmployees : []);
    } catch {
      this.employees.set([]);
    }

    this.selectedEmployeeId.set(this.employees()[0]?.employeeId ?? null);
  }

  private persistEmployees() {
    localStorage.setItem('employees', JSON.stringify(this.employees()));
  }

  private getSeedEmployees(): EmployeeModel[] {
    return [
      {
        employeeId: 1,
        name: 'Aarav Mehta',
        contactNo: '9876543210',
        email: 'aarav.mehta@company.test',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        altContactNo: '9123456780',
        address: 'Baner, Pune',
        designationId: 2,
        createdDate: new Date('2026-05-18T09:30:00'),
        modifiedDate: new Date('2026-05-28T14:15:00'),
        role: 'Developer',
      },
      {
        employeeId: 2,
        name: 'Sara Khan',
        contactNo: '9988776655',
        email: 'sara.khan@company.test',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        altContactNo: '9011223344',
        address: 'Andheri East, Mumbai',
        designationId: 4,
        createdDate: new Date('2026-05-20T11:45:00'),
        modifiedDate: new Date('2026-05-30T16:40:00'),
        role: 'Operations Lead',
      },
      {
        employeeId: 3,
        name: 'Daniel Thomas',
        contactNo: '9345678901',
        email: 'daniel.thomas@company.test',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        altContactNo: '9080706050',
        address: 'Indiranagar, Bengaluru',
        designationId: 1,
        createdDate: new Date('2026-05-22T08:20:00'),
        modifiedDate: new Date('2026-06-01T10:05:00'),
        role: 'HR Coordinator',
      },
    ];
  }
}
