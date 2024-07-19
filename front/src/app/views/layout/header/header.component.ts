import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../pages/auth/services/auth.service';
import { CartService } from '../../pages/services/cart.service';
import { WishlistService } from '../../pages/services/wishlist.service';
import { UserProfileService } from '../../shared/user/user-profile.service'; // Adjust the path as needed

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  cartCount = 0;
  wishCount = 0;
  sticky: boolean = false;
  loggedIn: boolean = false;
  profileImage: string | null = null;
  user: any = null;

  constructor(
    private _cartService: CartService,
    private _auth: AuthService,
    private _wishlistService: WishlistService,
    private _userProfileService: UserProfileService
  ) { }

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const windowScroll = window.pageYOffset;
    this.sticky = windowScroll >= 300;
  }

  ngOnInit(): void {
    this._cartService.cart$.subscribe((cart) => {
      this.cartCount = cart?.items?.length ?? 0;
    });
    this._wishlistService.wishList$.subscribe((wishList) => {
      this.wishCount = wishList?.items?.length ?? 0;
    });
    this.loggedIn = this._auth.loggedIn();
    console.log(this.loggedIn);

    this._userProfileService.profileData$.subscribe((profileData) => {
      this.user = profileData;
      this.profileImage = profileData?.profileImage || 'assets/images/avatar.jpg';
    });
  }
}
