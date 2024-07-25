import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  // Import Router
import { UserService } from './services/user.service';
import { AuthService } from '../auth/services/auth.service';  // Import AuthService
import { HotToastService } from '@ngneat/hot-toast';  // Import HotToastService

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user: any = {};

  constructor(
    private _userService: UserService,
    private _auth: AuthService,  // Inject AuthService
    private _router: Router,  // Inject Router
    private _toast: HotToastService  // Inject HotToastService
  ) { }

  ngOnInit(): void {
    const email = this._auth.getEmail();
    if (email) {
      this._userService.getUser(email).subscribe(
        (user: any) => {
          this.user = user;
        },
        (error: any) => {
          console.error('Error fetching user data', error);
        }
      );
    } else {
      console.error('No email found in local storage');
    }
  }

  logout(event: Event): void {
    event.preventDefault();  

    const toastRef = this._toast.loading('Logging you out...');  

    setTimeout(() => {
      this._auth.logout();  // Use AuthService to handle logout
      toastRef.close();  // Close the loading toast
      this._toast.success('Successfully logged out');  // Display the success toast message
      this._router.navigate(['/products']);  // Navigate to the products page
    }, 2000);  // Delay of 2 seconds
  }
}
