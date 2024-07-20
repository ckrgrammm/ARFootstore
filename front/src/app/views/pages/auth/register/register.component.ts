import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  passwordVisible: boolean = false;
  registerFormGroup!: FormGroup;
  isSubmitted: boolean = false;
  authError: boolean = false;
  authMessage:string = 'Email or Password are wrong';

  constructor(
    private _formBuilder: FormBuilder,
    private _auth: AuthService,
    private _toast: HotToastService,
    private _router: Router
  ) { }

  initRegisterForm() {
    this.registerFormGroup = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.registerFormGroup.invalid) return;

    this._auth.register(
      this.registerForm.name.value,
      this.registerForm.email.value,
      this.registerForm.password.value
    ).pipe(
      this._toast.observe({
        loading: 'Registering in...',
        success: 'Congrats! You are registered',
        error: ({ error }) => `There was an error: ${error.message} `
      })
    ).subscribe(
      () => {
        this.authError = false;
        this._router.navigate(['/auth']);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.authError = true;
        if (error.status !== 400) {
          this.authMessage = error.message;
        }
      }
    );
  }

  get registerForm() {
    return this.registerFormGroup.controls;
  }

  visibilityToggle() {
    this.passwordVisible = !this.passwordVisible;
  }

  ngOnInit(): void {
    this.initRegisterForm();
  }
}
