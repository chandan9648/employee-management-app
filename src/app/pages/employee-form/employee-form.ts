import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  saveEmployee() {
    this.employeeObj.modifiedDate = new Date();
    console.log('Employee payload', this.employeeObj);
  }

  resetForm() {
    this.employeeObj = new EmployeeModel();
  }
}
