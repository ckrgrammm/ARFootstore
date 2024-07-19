import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../user/services/user.service';
import { UserProfileService } from '../../../shared/user/user-profile.service';
import { LocalstorageService } from '../services/localstorage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  passwordVisible: boolean = false;
  loginFormGroup!: FormGroup;
  isSubmitted: boolean = false;
  authError: boolean = false;
  authMessage: string = 'Email or Password are wrong';

  constructor(
    private _formBuilder: FormBuilder,
    private _auth: AuthService,
    private _localstorageService: LocalstorageService,
    private _toast: HotToastService,
    private _router: Router,
    private _userService: UserService,
    private _userProfileService: UserProfileService 
  ) {}

  initLoginForm() {
    this.loginFormGroup = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.loginFormGroup.invalid) return;

    const email = this.loginForm.email.value;
    console.log('Email:', email);  // Log the email

    this._auth.login(email, this.loginForm.password.value).pipe(
      this._toast.observe({
        loading: 'Logging in...',
        success: 'Logged in successfully',
        error: ({ error }) => `There was an error: ${error.message} `
      })
    ).subscribe(
      (user) => {
        this.authError = false;
        this._localstorageService.setToken(user.access_token);
        this._localstorageService.setItem('email', email);  // Store email in local storage
        this._auth.startRefreshTokenTimer();

        // Fetch user details and set profile data
        this._userService.getUser(email).subscribe(
          (userDetails: any) => {
            this._userProfileService.setProfileData(userDetails);

            // Navigate based on roles
            if (user.roles === 'admin') {
              window.location.href = 'https://www.google.com'; // Navigate to an external URL
            } else {
              this._router.navigate(['/']);
            }
          },
          (error: any) => {
            console.error('Failed to fetch user details:', error);
          }
        );
      },
      (error: HttpErrorResponse) => {
        this.authError = true;
        if (error.status !== 400) {
          this.authMessage = error.message;
        }
      }
    );
  }

  get loginForm() {
    return this.loginFormGroup.controls;
  }

  visibilityToggle() {
    this.passwordVisible = !this.passwordVisible;
  }

  ngOnInit(): void {
    this.initLoginForm();
  }
}
