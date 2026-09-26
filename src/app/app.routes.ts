import { Routes } from '@angular/router';
import { Admin } from './admin/admin';
import { Notification } from './notification/notification';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./notification/notification').then((m) => Notification),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then((m) => Admin),
  },
  {
    path: '**',
    component: Notification,
  },
];
