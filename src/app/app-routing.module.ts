import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SignupComponent} from "./auth/signup/signup.component";
import {LoginComponent} from "./auth/login/login.component";
import {MessageComponent} from "./message/message/message.component";
import {authGuard} from "./authgaurd/auth.guard";
import {UnauthorizedComponent} from "./error/unauthorized/unauthorized.component";
import {InvalidUrlComponent} from "./error/invalid-url/invalid-url.component";
import {ProfileComponent} from "./profile/profile/profile.component";
import {HomeComponent} from "./home/home/home.component";

const routes: Routes = [
  // Redirect empty path to home
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path:'home',
    component:HomeComponent
  },
  {
    path:'signup',
    component:SignupComponent
  },
  {
    path:'login',
    component:LoginComponent
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path:'message',
    component:MessageComponent,
    canActivate: [authGuard]
  },
  {
    path:'profile',
    component:ProfileComponent,
    canActivate: [authGuard]
  },
  // 404 not found - this should remain last
  {
    path:'**',
    component:InvalidUrlComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
