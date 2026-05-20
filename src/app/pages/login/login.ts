import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginObj: any = {
    email: '',
    contactNo: '',
  };

  http = inject(HttpClient);

  login() {
    this.http.post(
      'http://localhost:5109/api/EmployeeMaster/login',
      this.loginObj
    ).subscribe({
      next: (result: any) => {
        debugger;
      },
      error: (err: any) => {
       debugger;
      }
    });
  }
}