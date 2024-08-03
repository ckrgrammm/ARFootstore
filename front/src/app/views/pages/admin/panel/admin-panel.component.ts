import { Component } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {

  constructor(private toast: HotToastService) {}

  show3DModelComingSoon(event: Event): void {
    event.preventDefault(); 
    this.toast.info('3D Model Coming soon');
  }
}
