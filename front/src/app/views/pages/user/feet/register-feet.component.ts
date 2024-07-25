import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-register-feet',
  templateUrl: './register-feet.component.html',
  styleUrls: ['./register-feet.component.css']
})
export class RegisterFeetComponent implements OnInit {
  leftFootFile: File | null = null;
  rightFootFile: File | null = null;
  leftFootSize: string | null = null;
  rightFootSize: string | null = null;
  email: string | null = null;
  currentHint: string = '';
  hints: string[] = [
    'Ensure more accurate measurement, please place an empty white color paper below your feet',
    'Foot should be in center, touching one edge of paper.',
    'Floor color should be different than white.',
    'Image should be clicked from top angle.',
    'Paper should be completely visible in the clicked image.'
  ];
  hintIndex: number = 0;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toast: HotToastService
  ) {
    this.email = this.authService.getEmail();
  }

  ngOnInit(): void {
    this.currentHint = this.hints[this.hintIndex];
    setInterval(() => {
      this.hintIndex = (this.hintIndex + 1) % this.hints.length;
      this.currentHint = this.hints[this.hintIndex];
    }, 3000);

    // Fetch user feet sizes from Firebase
    if (this.email) {
      const userDetails = this.authService.getUserDetailsFromLocalStorage();
      if (userDetails) {
        this.leftFootSize = userDetails.leftFeet;
        this.rightFootSize = userDetails.rightFeet;
      }
    }
  }

  onLeftFootFileSelected(event: any) {
    this.leftFootFile = event.target.files[0];
  }

  onRightFootFileSelected(event: any) {
    this.rightFootFile = event.target.files[0];
  }

  registerLeftFoot() {
    if (this.leftFootFile && this.email) {
      const formData = new FormData();
      formData.append('feetImage', this.leftFootFile);
      formData.append('email', this.email);
      formData.append('foot', 'left');

      this.userService.uploadFeetImage(formData).pipe(
        this.toast.observe({
          loading: 'Uploading left foot image...',
          success: 'Left foot image uploaded successfully',
          error: 'There was an error uploading the left foot image'
        })
      ).subscribe(response => {
        console.log('Left foot registered successfully', response);
        this.leftFootSize = response.feetSize;
        this.authService.setFeetSizes(this.leftFootSize, this.rightFootSize);
      }, error => {
        console.error('Error registering left foot', error);
      });
    } else {
      console.error('No file selected for left foot or email is null');
    }
  }

  registerRightFoot() {
    if (this.rightFootFile && this.email) {
      const formData = new FormData();
      formData.append('feetImage', this.rightFootFile);
      formData.append('email', this.email);
      formData.append('foot', 'right');

      this.userService.uploadFeetImage(formData).pipe(
        this.toast.observe({
          loading: 'Uploading right foot image...',
          success: 'Right foot image uploaded successfully',
          error: 'There was an error uploading the right foot image'
        })
      ).subscribe(response => {
        console.log('Right foot registered successfully', response);
        this.rightFootSize = response.feetSize;
        this.authService.setFeetSizes(this.leftFootSize, this.rightFootSize);
      }, error => {
        console.error('Error registering right foot', error);
      });
    } else {
      console.error('No file selected for right foot or email is null');
    }
  }
}
