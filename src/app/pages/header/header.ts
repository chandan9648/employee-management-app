import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isCollapsed = false;
  isMobileSidebarOpen = false;

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
