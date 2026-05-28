import {HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Department } from '../models/Department.model';
@Injectable({
  providedIn: 'root',
})
export class Master {
  apiUrl = 'http://localhost:7109/api';
  http = inject(HttpClient);

  getAllDept(){
    return this.http.get(this.apiUrl + '/DepartmentMaster/GetAllDepartments');
  }

  saveDept(obj: Department){
    return this.http.post(this.apiUrl + "DepartmentMaster/AddDepartment", obj);
  }
}
