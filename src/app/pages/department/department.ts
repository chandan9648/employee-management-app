import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Department as DepartmentModel } from '../../models/Department.model';
import { FormsModule } from '@angular/forms';
import { Master } from '../../services/master';


@Component({
  selector: 'app-department',
  standalone: true,
  imports: [FormsModule],
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

  resetForm() {
    this.newDepObj = new DepartmentModel();
  }

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
