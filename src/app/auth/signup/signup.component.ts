import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from "../auth.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  profilePhotoPreview: string | ArrayBuffer | null = null;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      gender: ['', Validators.required],
      profilePhoto: [null]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 500 * 1024; // 500KB

      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Please select a valid image file (JPEG, PNG, GIF)';
        return;
      }

      if (file.size > maxSize) {
        this.errorMessage = 'Image size should not exceed 2MB';
        return;
      }

      this.errorMessage = null;
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.profilePhotoPreview = base64String;
        this.signupForm.patchValue({
          profilePhoto: base64String // Send the complete base64 string including prefix
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      this.errorMessage = null;

      const formData = {
        fullName: this.signupForm.value.fullName,
        email: this.signupForm.value.email,
        username: this.signupForm.value.username,
        password: this.signupForm.value.password,
        confirmPassword: this.signupForm.value.confirmPassword, // Added confirmPassword
        gender: this.signupForm.value.gender,
        profilePhoto: this.signupForm.value.profilePhoto // Just the base64 string
      };

      this.authService.signup(formData).subscribe({
        next: (response) => {
          if(response.success === true) {
            this.loading = false;
            this.router.navigate(['/login'])
            this.successMessage = response.message;
            // Optional: Reset form after successful submission
            // this.signupForm.reset();
            // this.profilePhotoPreview = null;
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
          console.error('Signup error:', error);
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
