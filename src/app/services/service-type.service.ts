import { inject, Injectable } from '@angular/core';
import { environment } from '../environment';
import { Observable } from 'rxjs';
import { Service } from '../interfaces';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServiceTypeService {

  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = environment.apiServices; 

  getAllServices(): Observable<Service[]> {
    return this.httpClient.get<Service[]>(this.apiUrl);
  }



}
