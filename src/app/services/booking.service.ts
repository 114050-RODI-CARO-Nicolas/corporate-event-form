import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environment'
import { Observable } from 'rxjs';
import { Booking } from '../interfaces';



@Injectable({
  providedIn: 'root'
})
export class BookingService {

  
  private readonly httpClient = inject(HttpClient)
  private readonly apiUrl = environment.apiBookings;

  getBookings():Observable<Booking[]>{
    return this.httpClient.get<Booking[]>(this.apiUrl);
  }

  create(booking: Booking): Observable<Booking> {
    return this.httpClient.post<Booking>(this.apiUrl, booking);
  }

}
