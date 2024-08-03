import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.componet.html',
  styleUrls: ['./coming-soon.componet.css']
})
export class ComingSoonComponent implements OnInit, OnDestroy {
  targetDate: Date = new Date('2024-12-31T23:59:59');
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private intervalId!: number;

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = window.setInterval(() => this.updateCountdown, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateCountdown = () => {
    const now = new Date().getTime();
    const distance = this.targetDate.getTime() - now;

    if (distance < 0) {
      clearInterval(this.intervalId);
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      return;
    }

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  };
}
