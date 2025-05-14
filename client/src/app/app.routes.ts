import { Routes } from '@angular/router';
import { RegisterComponent } from './Components/User/register/register.component';
import { LoginComponent } from './Components/User/login/login.component';
import {HomeComponent} from "./Layouts/home/home.component";
import {AuthCallbackComponent} from "./Components/User/auth-callback/auth-callback.component";
import {AdminDashboardComponent} from "./Layouts/admin-dashboard/admin-dashboard.component";
import { AuthGuard } from './Guards/auth.guard';
import {ChangePasswordComponent} from "./Components/User/change-password/change-password.component";
import {CreateOrganisateurComponent} from "./Components/User/register-organisateur/register-organisateur.component";
import {UsersComponent} from "./Components/User/users/users.component";
import {OrganizersComponent} from "./Components/User/orgonizers/orgonizers.component";
import {WorkshopsComponent} from "./Components/Workshop/workshop/workshop.component";
import {EnrollmentsComponent} from "./Components/Workshop/enrollments/enrollments.component";
import {MainLayoutComponentComponent} from "./Layouts/main-layout-component/main-layout-component.component";
import { WorkshopUserComponent } from './Components/Workshop/workshop-user/workshop-user.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponentComponent,
    children: [
      { path: 'workshops', component: WorkshopUserComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'register-organisateur', component: CreateOrganisateurComponent },
      { path: 'registerUser', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'auth/callback', component: AuthCallbackComponent },
      { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
    ],
  },
  { path: 'admin-dashboard', component: AdminDashboardComponent,canActivate: [AuthGuard],
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'organizers', component: OrganizersComponent },
      { path: 'workshops', component: WorkshopsComponent },
      { path: 'enrollments', component: EnrollmentsComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },

];
