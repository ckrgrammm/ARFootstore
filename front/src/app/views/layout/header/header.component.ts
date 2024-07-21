import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../pages/auth/services/auth.service';
import { ProductService } from '../../pages/products/services/product.service';
import { CartService } from '../../pages/services/cart.service';
import { WishlistService } from '../../pages/services/wishlist.service';
import { UserProfileService } from '../../shared/user/user-profile.service'; 
import { Router } from '@angular/router';

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
  isAdmin: boolean = false;

  searchQuery: string = '';
  searchResults: any[] = [];
  showResults: boolean = false; 

  constructor(
    private _cartService: CartService,
    private _auth: AuthService,
    private _wishlistService: WishlistService,
    private _userProfileService: UserProfileService,
    private _productService: ProductService,
    private _router: Router
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

    this._auth.loggedInStatus$.subscribe(status => {
      this.loggedIn = status;
      if (this.loggedIn) {
        this.loadUserProfile();
      } else {
        this.user = null;
        this.profileImage = null;
        this.isAdmin = false;
      }
    });

    if (this._auth.loggedIn()) {
      this.loggedIn = true;
      this.loadUserProfile();
    } else {
      this.loggedIn = false;
      this.user = null;
      this.profileImage = null;
      this.isAdmin = false;
    }
  }

  loadUserProfile() {
    this._userProfileService.profileData$.subscribe((profileData) => {
      this.user = profileData;
      this.profileImage = profileData?.profileImage || 'assets/images/avatar.jpg';
      this.isAdmin = profileData?.roles === 'admin';
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this._auth.logout();
    this._userProfileService.clearProfileData();
    this.loggedIn = false;
    this.user = null;
    this.profileImage = null;
    this.isAdmin = false;
    this._router.navigate(['/products']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this._productService.searchProducts(this.searchQuery.trim()).subscribe(
        (results) => {
          this.searchResults = results;
          this.showResults = true; // Show search results
          console.log('Search results:', this.searchResults);
        },
        (error) => {
          console.error('Error searching products:', error);
        }
      );
    }
  }

  navigateToProduct(productId: string): void {
    this._router.navigate(['/products', productId]);
    this.showResults = false; 
  }
}
