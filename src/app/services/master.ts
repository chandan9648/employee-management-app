import {HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Department } from '../models/Department.model';
import { DesignationModel } from '../models/Designation.model';
@Injectable({
  providedIn: 'root',
})
export class Master {
  apiUrl = 'https://localhost:7011/api';
  http = inject(HttpClient);

  //Department Master
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

  //Designation Master
  getAllDesignation(){
    return this.http.get(this.apiUrl + '/DesignationMaster/GetAllDesignations');
  }
  
  saveDesignation(obj: DesignationModel){
    return this.http.post(this.apiUrl + '/DesignationMaster/AddDesignation', obj);
  }
  updateDesignation(obj: DesignationModel){
    return this.http.put(this.apiUrl + '/DesignationMaster/UpdateDesignation', obj);
  }
  deleteDesignation(id: number){
    return this.http.delete(this.apiUrl + '/DesignationMaster/DeleteDesignation?designationId=' + id);
}

}