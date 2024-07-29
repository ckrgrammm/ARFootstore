import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../services/admin-admin.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-view-admin',
  templateUrl: 'view-admin.component.html',
})
export class ViewAdminComponent implements OnInit {
  admin: any;
  isLoading = true;
  error = '';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    const adminId = this.route.snapshot.paramMap.get('id')!;
    this.loadAdminData(adminId);
  }

  loadAdminData(id: string): void {
    this.adminService.getAdminById(id).subscribe(
      (admin) => {
        this.admin = admin;
        this.isLoading = false;
      },
      (error) => {
        this.error = 'Error loading admin data: ' + error.message;
        this.isLoading = false;
      }
    );
  }
}
