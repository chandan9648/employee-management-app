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

  }
  getAllDepartments() {
    this.masterService.getAllDept().subscribe({
      next: (result: any) => {
        this.deptList.set(result);
      }
    })

  }
}
