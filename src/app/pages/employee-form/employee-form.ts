import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EmployeeModel } from '../../models/Employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm {
  employeeObj = new EmployeeModel();
  private readonly router = inject(Router);

  saveEmployee() {
    const employees = this.readEmployees();
    const now = new Date();

    this.employeeObj.createdDate = this.employeeObj.createdDate ?? now;
    this.employeeObj.modifiedDate = now;

    if (!this.employeeObj.employeeId) {
      this.employeeObj.employeeId = this.getNextEmployeeId(employees);
    }

    const nextEmployee = { ...this.employeeObj };
    const existingIndex = employees.findIndex((employee) => employee.employeeId === nextEmployee.employeeId);

    if (existingIndex >= 0) {
      employees[existingIndex] = nextEmployee;
    } else {
      employees.push(nextEmployee);
    }

    localStorage.setItem('employees', JSON.stringify(employees));
    alert('Employee saved successfully');
    this.resetForm();
    this.router.navigateByUrl('/employee-list');
  }

  resetForm() {
    this.employeeObj = new EmployeeModel();
  }

  private readEmployees(): EmployeeModel[] {
    const rawEmployees = localStorage.getItem('employees');

    if (!rawEmployees) {
      return [];
    }

    try {
      const parsedEmployees = JSON.parse(rawEmployees) as EmployeeModel[];
      return Array.isArray(parsedEmployees) ? parsedEmployees : [];
    } catch {
      return [];
    }
  }

  private getNextEmployeeId(employees: EmployeeModel[]) {
    return employees.reduce((maxId, employee) => Math.max(maxId, employee.employeeId), 0) + 1;
  }
}
