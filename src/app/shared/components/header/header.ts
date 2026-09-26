import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private router = inject(Router);

  isAdminView = signal<boolean>(false);

  ngOnInit(): void {
    if (window.location.pathname.includes('admin')) this.isAdminView.set(true);
  }

  changeView(): void {
    let boolValue = this.isAdminView();
    this.isAdminView.set(!boolValue);

    if (boolValue) this.router.navigate(['']);
    else this.router.navigate(['admin']);
  }
}
