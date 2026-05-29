import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department as DepartmentModel } from '../../models/Department.model';
import { FormsModule } from '@angular/forms';
import { Master } from '../../services/master';


@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department.html',
  styleUrl: './department.css',
})
export class Department implements OnInit {

  newDepObj: DepartmentModel = new DepartmentModel();
  masterService = inject(Master);
  deptList: WritableSignal<DepartmentModel[]> = signal([]);
  ngOnInit(): void {
    this.getAllDepartments();
  }

  //Reset Form
  resetForm() {
    this.newDepObj = new DepartmentModel();
  }

  //Edit Department
  editDepartment(item: DepartmentModel) {
    this.newDepObj = { ...item };
  }

  //Delete Department
  deleteDepartment(item: DepartmentModel) {
    const shouldDelete = confirm(`Delete department "${item.departmentName}"?`);

    if (!shouldDelete) {
      return;
    }

    this.deptList.update((items) => items.filter((dept) => dept.departmentId !== item.departmentId));
  }

  //Update Department
  UpdateDept() {
    const index = this.deptList().findIndex(dept => dept.departmentId === this.newDepObj.departmentId);
    if (index !== -1) {
      this.deptList.update(items => {
        const updatedItems = [...items];
        updatedItems[index] = { ...this.newDepObj };
        return updatedItems;
      });
      alert("Department updated successfully");
      this.resetForm();
    } else {
      alert("Department not found");
    }
  }

  //Save Department
  SaveDept() {
   this.masterService.saveDept(this.newDepObj).subscribe({
    next: (result: any) => {
     debugger;
     alert("Department saved successfully");
     this.getAllDepartments();
    },
    error: (error)=>{
      debugger;
      alert(error.error);
    }
   })
  }

  //Get All Departments
  getAllDepartments() {
    this.masterService.getAllDept().subscribe({
      next: (result: any) => {
        this.deptList.set(this.normalizeDepartments(result));
      },
      error: (error: any) => {
        console.error('Failed to load departments', error);
        this.deptList.set([]);
      }
    })

  }


  private normalizeDepartments(result: unknown): DepartmentModel[] {
    if (Array.isArray(result)) {
      return result as DepartmentModel[];
    }

    if (result && typeof result === 'object') {
      const response = result as { data?: unknown; result?: unknown; items?: unknown };
      const payload = response.data ?? response.result ?? response.items;

      if (Array.isArray(payload)) {
        return payload as DepartmentModel[];
      }
    }

    return [];
  }
}
