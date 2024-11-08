import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environment';
import { Observable } from 'rxjs';
import { Venue } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class VenueService {

  private readonly httpClient = inject(HttpClient)
  private readonly apiUrl = environment.apiBookings;

  getAllVenues(): Observable<Venue[]> {
    return this.httpClient.get<Venue[]>(this.apiUrl);
  }



}
