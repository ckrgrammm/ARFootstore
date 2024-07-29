import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin-admin.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-edit-admin',
  templateUrl: './edit-admin.component.html',
  styleUrls: ['./edit-admin.component.css']
})
export class EditAdminComponent implements OnInit {
  adminForm: FormGroup;
  isSubmitted = false;
  adminId!: string;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: HotToastService
  ) {
    this.adminForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.adminId = this.route.snapshot.paramMap.get('id')!;
    this.adminService.getAdmin(this.adminId).subscribe(
      (admin: any) => {
        this.adminForm.patchValue({
          name: admin.name,
          email: admin.email
        });
      },
      (error: any) => {
        this.toast.error('Error fetching admin: ' + error.message);
      }
    );
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.adminForm.invalid) {
      return;
    }

    this.adminService.updateAdmin(this.adminId, this.adminForm.getRawValue()).subscribe(
      () => {
        this.toast.success('Admin updated successfully');
        this.router.navigate(['/admin/admins']);
      },
      (error: any) => {
        this.toast.error('Error updating admin: ' + error.message);
      }
    );
  }
}
