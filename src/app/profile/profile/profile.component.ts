import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  genders = ['male', 'female', 'other'];
  base64Image: string = '';

  constructor(private fb: FormBuilder, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.initForm();
    this.getProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      profilePhoto: ['']
    });
  }

  getProfile() {
    this.profileService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          this.base64Image = data.profilePhoto;
          this.profileForm.patchValue({
            fullName: data.fullName,
            username: data.username,
            email: data.email,
            gender: data.gender,
            profilePhoto: data.profilePhoto
          });
        }
      },
      error: (err) => console.error('Error fetching profile:', err)
    });
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.base64Image = reader.result as string;
        this.profileForm.patchValue({ profilePhoto: this.base64Image });
      };
      reader.readAsDataURL(file);
    }
  }

  showSuccessAlert = false;

  editProfile() {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.getRawValue();
      this.profileService.updateProfile(updatedData).subscribe({
        next: (res) => {
          if (res.success === true) {
            this.showSuccessAlert = true;

            // Delay the getProfile call slightly to allow alert to render
            setTimeout(() => {
              this.getProfile();
            }, 200);

            // Auto-dismiss the alert after 3 seconds
            setTimeout(() => {
              this.showSuccessAlert = false;
            }, 3000);
          }
        },
        error: (err) => console.error('Update failed', err)
      });
    }
  }

  goBack() {
    window.history.back();
  }

}
