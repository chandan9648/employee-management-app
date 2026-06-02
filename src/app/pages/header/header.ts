import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EmployeeModel } from '../../models/Employee.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isCollapsed = false;
  isMobileSidebarOpen = false;
  // loggedEmpData: EmployeeModel = new EmployeeModel();

  // constructor() {
  //   const localData = localStorage.getItem('empLoginUser');

  //   if (localData != null) {
  //     this.loggedEmpData = JSON.parse(localData);
  //   }
  // }

  toggleSidebar() {
    if (window.innerWidth < 992) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
      return;
    }

    this.isCollapsed = !this.isCollapsed;
  }

  closeSidebar() {
    this.isMobileSidebarOpen = false;
  }

  logout() {
    localStorage.removeItem('empLoginUser');
  }
}
