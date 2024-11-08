import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environment';
import { map, Observable } from 'rxjs';
import {VenueAvailability} from '../interfaces'

@Injectable({
  providedIn: 'root'
})
export class VenueAvailabilityService {

  private readonly httpClient = inject(HttpClient)
  private readonly apiUrl = environment.apiAvailability;

  checkVenuesAvailabilityByDate(date: string): Observable<VenueAvailability[]> {
    const params = new HttpParams()
      .set('date', date)

    return this.httpClient.get<VenueAvailability[]>(this.apiUrl, { params });
  }

  checkVenueAvailability(venueId: string, date: string): Observable<boolean> {
    return this.checkVenuesAvailabilityByDate(date).pipe(
      map((availabilities) => {
        const availabilityForVenue = availabilities.find(avail => avail.venueId === venueId);
        return availabilityForVenue ? availabilityForVenue.available : false;
      })
    );
  }














}
