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


  checkAllVenueAvailability(): Observable<VenueAvailability[]>{
    return this.httpClient.get<VenueAvailability[]>(this.apiUrl);
  }



  checkVenueAvailability(venueId: string, date: string): Observable<boolean> {
    return this.checkAllVenueAvailability().pipe(
      map((availabilities) => {
        const availabilityForVenue = availabilities.find(avail => avail.venueId === venueId && avail.date === date);
        return availabilityForVenue ? availabilityForVenue.available : true; //Si no existe el registro que coincida se asume que el venue esta disponible
      })
    );
  }


 














}
