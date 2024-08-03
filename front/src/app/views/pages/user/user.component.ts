import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  
import { UserService } from './services/user.service';
import { AuthService } from '../auth/services/auth.service';  
import { HotToastService } from '@ngneat/hot-toast'; 

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user: any = {};

  constructor(
    private _userService: UserService,
    private _auth: AuthService,  
    private _router: Router, 
    private _toast: HotToastService  
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
      this._auth.logout(); 
      toastRef.close();  
      this._toast.success('Successfully logged out'); 
      this._router.navigate(['/products']); 
    }, 2000); 
  }
}
