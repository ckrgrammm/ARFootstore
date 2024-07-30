import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { LocalstorageService } from '../../auth/services/localstorage.service';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any = {};
  isVisable: boolean = false;
  isSubmitted: boolean = false;
  profileFormGroup!: FormGroup;
  editUserFormGroup!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _localstorageService: LocalstorageService,
    private _toast: HotToastService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const email = this._localstorageService.getEmail();
    const userDetails = this._localstorageService.getUserDetails();

    if (userDetails) {
      this.profile = userDetails;
      this.initProfileForm();
    } else if (email) {
      this._userService.getUser(email).subscribe(
        (user) => {
          this.profile = user;
          this.initProfileForm();
          this._localstorageService.setUserDetails(user); 
        },
        (error: HttpErrorResponse) => {
          console.error('Error fetching user data:', error);
        }
      );
    } else {
      console.error('Email is not available in local storage.');
    }
  }

  initProfileForm() {
    this.profileFormGroup = this._formBuilder.group({
      name: [this.profile.name, Validators.required],
      email: [{ value: this.profile.email, disabled: true }, [Validators.required, Validators.email]],
      contactNumber: [this.profile.contactNumber, Validators.required],
      profileImage: [this.profile.profileImage],
      address: [this.profile.address, Validators.required]
    });
  }

  initEditUserForm() {
    this.editUserFormGroup = this._formBuilder.group({
      name: [this.profile.name || '', Validators.required],
      email: [{ value: this.profile.email || '', disabled: true }, [Validators.required, Validators.email]],
      contactNumber: [this.profile.contactNumber || '', Validators.required],
      address: [this.profile.address || '', Validators.required]
    });
  }

  openEditModal(user: any) {
    this.profile = user;
    this.isVisable = true;
    this.initEditUserForm();
  }

  closeEditModal() {
    this.isVisable = false;
    this.isSubmitted = false;
    this.selectedFile = null;
    this.initProfileForm();
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.editUserFormGroup.invalid) return;

    const formData = new FormData();
    formData.append('email', this.profile.email);
    formData.append('contactNumber', this.editUserFormGroup.get('contactNumber')?.value);
    formData.append('address', this.editUserFormGroup.get('address')?.value);
    formData.append('name', this.editUserFormGroup.get('name')?.value);
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this._userService.updateUser(formData).pipe(
      this._toast.observe({
        loading: 'Updating profile...',
        success: 'Profile updated successfully',
        error: ({ error }) => `There was an error: ${error.message}`
      })
    ).subscribe(
      (response) => {
        this.updateLocalStorageProfile(response); 
        this.profile = { ...this.profile, ...response }; 
        this.isVisable = false;
        this.isSubmitted = false;
        this.initProfileForm(); 
        this.cdRef.detectChanges(); // Explicitly trigger change detection
      },
      (error: HttpErrorResponse) => {
        this.isSubmitted = false;
        console.log('Update profile error:', error);
      }
    );
  }

  get profileForm() {
    return this.profileFormGroup.controls;
  }

  get editUserForm() {
    return this.editUserFormGroup.controls;
  }

  updateLocalStorageProfile(updatedProfile: any) {
    const currentProfile = this._localstorageService.getUserDetails();
    const newProfile = { ...currentProfile, ...updatedProfile };
    this._localstorageService.setUserDetails(newProfile);
    this.profile = newProfile; 
    this.cdRef.detectChanges(); // Ensure profile is updated immediately
  }
}
