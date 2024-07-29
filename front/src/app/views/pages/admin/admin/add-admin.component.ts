import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin-admin.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-add-admin',
  templateUrl: 'add-admin.component.html',
  styleUrls: ['add-admin.component.css']
})
export class AddAdminComponent implements OnInit {
  adminForm: FormGroup;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private toast: HotToastService
  ) {
    this.adminForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.adminForm.invalid) {
      return;
    }

    this.adminService.addAdmin(this.adminForm.value).subscribe(
      () => {
        this.toast.success('Admin added successfully');
        this.router.navigate(['/admin/admins']);
      },
      (error) => {
        this.toast.error('Error adding admin: ' + error.message);
      }
    );
  }
}
