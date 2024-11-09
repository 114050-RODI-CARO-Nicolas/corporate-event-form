import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { Booking } from '../interfaces';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html',
  styles: [`
    .badge { text-transform: capitalize; }
  `],
  imports: [CurrencyPipe],
  standalone: true
})
export class BookingsListComponent  {

  private readonly bookingService = inject(BookingService);

  allBookings : Booking[] = [];


  getBookings(){
    this.bookingService.getBookings().subscribe({
      next: (data) =>{
        this.allBookings = data;
      }
    })
    
  }


 
  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}
