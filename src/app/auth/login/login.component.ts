import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AuthService} from "../auth.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  verifyForm!: FormGroup;
  isLoggedIn: boolean = false;
  emailSent: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isLoggingIn = false;
  isVerifying = false;


  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', Validators.required]
    });
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoggingIn = false;
        if (res.success === true) {
          this.isLoggedIn = true;
          this.emailSent = true;
          this.verifyForm.patchValue({ email: this.loginForm.value.email });
          this.showSuccess(res.message);
        } else {
          this.showError('Login failed.');
        }
      },
      error: () => {
        this.isLoggingIn = false;
        this.showError('Login failed. Please check your credentials.');
      }
    });
  }


  onVerifySubmit(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isVerifying = true;
    this.authService.verifyEmail(this.verifyForm.value).subscribe({
      next: (res) => {
        this.isVerifying = false;
        if (res.success) {
          this.showSuccess(res.message);
          localStorage.setItem('token', res.data.token);
          setTimeout(() => {
            this.router.navigate(['/message']);
          }, 1000);
        } else {
          this.showError('Verification failed.');
        }
      },
      error: () => {
        this.isVerifying = false;
        this.showError('Verification failed. Invalid code or email.');
      }
    });
  }

}
