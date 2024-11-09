import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { Booking } from '../interfaces';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html',
  styles: [`
    .badge { text-transform: capitalize; }
  `],
  imports: [CurrencyPipe, DatePipe, CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  standalone: true
})
export class BookingsListComponent implements OnInit  {
  

  private readonly bookingService = inject(BookingService);

  searchTerm : FormControl = new FormControl('');



  allBookings : Booking[] = [];
  filteredBookings : Booking[] = [];


  ngOnInit(): void {
    this.getBookings();
    this.searchTerm.valueChanges.subscribe(data => {
      if (this.searchTerm.value == null || this.searchTerm.value === ''){
        this.filteredBookings = this.allBookings;
      } else {

        this.filteredBookings = this.allBookings.filter(booking => 
          booking.companyName.toLowerCase().includes(this.searchTerm.value.toLowerCase())
          ||
          booking.bookingCode?.toLowerCase().includes(this.searchTerm.value.toLowerCase())
        )
      }
    })
    
  
  }






  getBookings(){
    this.bookingService.getBookings().subscribe({
      next: (data) =>{
        this.allBookings = data;
        this.filteredBookings = this.allBookings;
      }
    });


    
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
