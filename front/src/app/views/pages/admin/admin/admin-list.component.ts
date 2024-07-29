import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin-admin.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  admins: any[] = [];
  isLoading = true;
  error = '';

  constructor(
    private adminService: AdminService,
    private toast: HotToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchAdmins();
  }

  fetchAdmins(): void {
    this.adminService.getAdmins().subscribe(
      (data: any[]) => {
        this.admins = data;
        this.isLoading = false;
      },
      (error) => {
        this.error = 'Error fetching admins: ' + error.message;
        this.isLoading = false;
      }
    );
  }

  addAdmin(): void {
    this.router.navigate(['/admin/admins/add']);
  }

  editAdmin(id: string): void {
    this.router.navigate(['/admin/admins/edit', id]);
  }

  deleteAdmin(id: string): void {
    if (confirm('Are you sure you want to delete this admin?')) {
      this.adminService.deleteAdmin(id).subscribe(
        () => {
          this.toast.success('Admin deleted successfully');
          this.admins = this.admins.filter(admin => admin.id !== id);
        },
        (error) => {
          this.toast.error('Error deleting admin: ' + error.message);
        }
      );
    }
  }
}
