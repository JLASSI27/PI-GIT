import { Routes } from '@angular/router';
import { RegisterComponent } from './Components/register/register.component';
import { LoginComponent } from './Components/login/login.component';
import {HomeComponent} from "./Components/home/home.component";
import {AuthCallbackComponent} from "./Components/auth-callback/auth-callback.component";
import {AdminDashboardComponent} from "./Components/admin-dashboard/admin-dashboard.component";
import { AuthGuard } from './Guards/auth.guard';

export const routes: Routes = [
  { path: 'registerUser', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent,canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: LoginComponent }
];
