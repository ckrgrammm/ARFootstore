// forget-password.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  email: string = '';
  message: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.authService.forgotPassword(this.email).subscribe(
      response => {
        this.message = 'Password reset link has been sent to your email.';
      },
      error => {
        this.message = 'An error occurred. Please try again.';
      }
    );
  }
}
