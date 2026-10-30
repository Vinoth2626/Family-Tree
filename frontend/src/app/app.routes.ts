import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminFamiliesComponent } from './pages/admin-families/admin-families.component';
import { AdminFamilyDetailComponent } from './pages/admin-family-detail/admin-family-detail.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { FamilyPageComponent } from './pages/family-page/family-page.component';
import { PublicDirectoryComponent } from './pages/public-directory/public-directory.component';

export const routes: Routes = [
  { path: '', component: PublicDirectoryComponent },
  { path: 'families', component: PublicDirectoryComponent },
  { path: 'family/:slug', component: FamilyPageComponent },
  { path: 'family/:slug/person/:personId', component: FamilyPageComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/families', component: AdminFamiliesComponent },
  { path: 'admin/families/:id', component: AdminFamilyDetailComponent },
  { path: '**', redirectTo: '' },
];
