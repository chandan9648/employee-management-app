import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  router = inject(Router);

  login() {
    this.http.post(
      'https://localhost:7011/api/EmployeeMaster/login',
      this.loginObj
    ).subscribe({
      next: (result: any) => {
        localStorage.setItem('empLoginUser', JSON.stringify(result.data));
        this.router.navigateByUrl("/dashboard");
      },
      error: (err: any) => {
       const message = err?.error instanceof ProgressEvent
        ? 'Unable to reach the login server. Check that the backend is running.'
        : err?.error?.message || err?.error || err?.message || 'Login failed. Please try again.';

       alert(message);
      }
    });
  }
}