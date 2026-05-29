import {HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Department } from '../models/Department.model';
@Injectable({
  providedIn: 'root',
})
export class Master {
  apiUrl = 'https://localhost:7011/api';
  http = inject(HttpClient);

  getAllDept(){
    return this.http.get(this.apiUrl + '/DepartmentMaster/GetAllDepartments');
  }

  saveDept(obj: Department){
    return this.http.post(this.apiUrl + '/DepartmentMaster/AddDepartment', obj);
  }

  updateDept(obj: Department){
    return this.http.put(this.apiUrl + '/DepartmentMaster/UpdateDepartment', obj);
  }

  deleteDept(id: number){
    return this.http.delete(this.apiUrl + '/DepartmentMaster/DeleteDepartment?departmentId=' + id);
  }
}
