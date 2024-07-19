import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  // Import Router
import { UserService } from './services/user.service';
import { LocalstorageService } from '../auth/services/localstorage.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user: any = {};

  constructor(
    private _userService: UserService,
    private _localstorageService: LocalstorageService,
    private _router: Router  // Inject Router
  ) { }

  ngOnInit(): void {
    const email = this._localstorageService.getEmail();
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
    event.preventDefault();  // Prevent the default anchor behavior
    this._localstorageService.removeToken();  // Remove token from local storage
    this._router.navigate(['/login']);  // Navigate to the login page or appropriate page
  }
}
