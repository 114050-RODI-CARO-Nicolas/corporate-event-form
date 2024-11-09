import { Component, inject, OnInit } from '@angular/core';
import { Booking, Service, Venue } from '../interfaces';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { map, Observable, of } from 'rxjs';
import { VenueAvailabilityService } from '../services/venue-availability.service';
import { BookingService } from '../services/booking.service';
import { VenueService } from '../services/venue.service';
import { ServiceTypeService } from '../services/service-type.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-booking.component.html',
  styleUrl: './create-booking.component.css'
})
export class CreateBookingComponent implements OnInit {

  private readonly bookingService = inject(BookingService);
  private readonly venueAvailabilityService = inject(VenueAvailabilityService);
  private readonly venueService = inject(VenueService);
  private readonly serviceTypeService = inject(ServiceTypeService);
  private readonly router = inject(Router);


  grandTotal : number = 0;
  generalSubtotal: number = 0;

  discountApplies : boolean = false;
  discountPercentage: number = 0;

  calculateGrandTotal(): void {

    // calcular el total en base al pricePerHour del venue 
    //sumar los additional services en base a su pricePerPerson
    

    let subtotal = 0;
    let venueCost = 0;
    let additionalServicesSubtotal = 0;

    const selectedVenueId = this.reserveForm.get('eventData')?.get('selectedVenueId')?.value;
    let eventHours = 0;

    const eventStartTime = this.reserveForm.get('eventData')?.get('startTime')?.value;
    const eventEndTime = this.reserveForm.get('eventData')?.get('endTime')?.value;


    if(eventStartTime && eventEndTime){
      const startDate = new Date(`2000-01-01T${eventStartTime}`)
      const endDate = new Date(`2000-01-01T${eventEndTime}`)

      const differenceInMiliseconds = endDate.getTime() - startDate.getTime();
      eventHours = differenceInMiliseconds / (1000 * 60 * 60 );

      if(selectedVenueId){
        const selectedVenueObject = this.availableVenues.find(v => v.id === selectedVenueId );
        if(selectedVenueObject){
          const pricePerHour = selectedVenueObject.pricePerHour;
          venueCost = pricePerHour * eventHours

  
        }
      }
    }

    this.additionalServices.controls.forEach( control => {
      const selectedServiceId = control.get('serviceId')?.value;
      if(selectedServiceId){
        const matchingService = this.availableServiceTypes.find(s=> s.id === selectedServiceId); 
        if(matchingService){
          const quantityValue = control.get('quantity')?.value;
          if(quantityValue){
            control.get('serviceSubtotal')?.patchValue(quantityValue * matchingService.pricePerPerson);
            additionalServicesSubtotal += quantityValue * matchingService.pricePerPerson;
          }
        }
      }
    })



    subtotal = venueCost + additionalServicesSubtotal;
    this.generalSubtotal = subtotal;

    const peopleAmount = this.eventData.get('peopleAmount')?.value;
    if(peopleAmount){
     this.discountApplies = peopleAmount > 100; 
    this.grandTotal = this.discountApplies ? subtotal * 0.75 : subtotal;
    }

  }


  loadAvailableVenues():void{
    this.venueService.getAllVenues().subscribe({
      next: (data) =>  {
        this.availableVenues=data;
      },
      error: (err) => {
        console.error('Error loading available venues: ', err)
      }
    })
  }

  loadAvailableServiceTypes():void{
    this.serviceTypeService.getAllServices().subscribe({
      next: (data) =>  {
        this.availableServiceTypes=data;
      },
      error: (err) => {
        console.error('Error loading available service types: ', err)
      }
    })
  }


  ngOnInit(): void {
    this.loadAvailableVenues();
    this.loadAvailableServiceTypes();
  }

  availableVenues: Venue[] = [];
  availableServiceTypes: Service[] = [];


  reserveForm: FormGroup = new FormGroup({
    companyData: new FormGroup({
      companyName: new FormControl('', [Validators.required, Validators.min(5)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required])

    }),
    eventData: new FormGroup({
      selectedVenueId: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      startTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required),
      peopleAmount: new FormControl(1, [Validators.required]),
    }, {asyncValidators: this.venueAvailabilityValidator()}), 
 
    additionalServices: new FormArray([])
  }); 

  addAditionalService() {
    const additionalServiceForm = new FormGroup({
      serviceId : new FormControl('', [Validators.required]),
      quantity: new FormControl(10, [Validators.required, Validators.min(10)]),
      startTime: new FormControl('', Validators.required), //Aplicar validador de rango de hora valido
      endTime: new FormControl('', Validators.required),
      serviceSubtotal: new FormControl(0),
    },
    {validators: this.serviceTimeRangeValidator()}
  )

  additionalServiceForm.get('quantity')?.valueChanges.subscribe(()=>{
    this.calculateGrandTotal();

  })

  this.additionalServices.push(additionalServiceForm)
  }

  removeAdditionalServiceForm(index: number){
    this.additionalServices.removeAt(index);
    this.calculateGrandTotal();
  }




  get additionalServices(): FormArray{
    return this.reserveForm.get('additionalServices') as FormArray;
  }

  get eventData(): FormGroup {
    return this.reserveForm.get('eventData') as FormGroup;
  }

  get companyData(): FormGroup {
    return this.reserveForm.get('companyData') as FormGroup;
  }



  // Form submit function


  onSubmitForm(){

    console.log('reserveForm: ', this.reserveForm)

    if(this.reserveForm.valid){
      const reserveFormValue = this.reserveForm.value;

      const booking : Booking = {
        
        bookingCode: this.generateRandomCode(),
        companyName: reserveFormValue.companyData.companyName,
        companyEmail: reserveFormValue.companyData.email,
        contactPhone: reserveFormValue.companyData.phone,
        venueId:  reserveFormValue.eventData.selectedVenueId,
        eventDate: reserveFormValue.eventData.date,
        startTime: reserveFormValue.eventData.startTime,
        endTime:  reserveFormValue.eventData.endTime,
        totalPeople: reserveFormValue.eventData.peopleAmount,
        services: reserveFormValue.additionalServices,
        totalAmount: this.calculateTotalAmountForEvent(),
        createdAt: new Date(this.getSystemDate())
        
      }
      console.log('booking object created: ', booking)
      this.bookingService.create(booking).subscribe({
        next: () => {
          this.router.navigate(['/bookings'])
        }
      })
    }
  }

  getSystemDate(){
    return Date.now()
  }

  calculateTotalAmountForEvent(){
    return 10000;
  }


  generateRandomCode(){

    return 'abcde';

  }







  /// Validadores sincronos de rango temporal


  private eventTimeRangeValidator(): ValidatorFn {
    return (group: AbstractControl) : ValidationErrors | null => {
      const startTime = group.get('startTime')?.value;
      const endTime = group.get('endTime')?.value;

      if(!startTime || !endTime) return null;

      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);

      return start >= end ? {invalidEventTimeRange: true} : null
    }
  }

  private serviceTimeRangeValidator(): ValidatorFn {

    // Esta validacion tal vez es demasiada compleja con respecto a lo que pide el enunciado. 
    //Probablemente solo con validar serviceStartTime contra serviceEndTime alcanzaba


    return (group: AbstractControl) : ValidationErrors | null => {
      
      const serviceStartTime = group.get('startTime')?.value;
      const serviceEndTime = group.get('endTime')?.value;

      console.log('serviceStartTime: ', serviceStartTime);
      console.log('serviceEndTime: ', serviceEndTime);

    
      //Considerando que el servicio tiene que ocurrir dentro del evento principal
      const eventStartTime = this.eventData.get('startTime')?.value;
      const eventEndTime = this.eventData.get('endTime')?.value;

      console.log('eventStartTime: ', eventStartTime);
      console.log('eventEndTime: ', eventEndTime);



      if (!serviceStartTime || !serviceEndTime || !eventStartTime || !eventEndTime) return null;

      const serviceStart = new Date(`2000-01-01T${serviceStartTime}`);
      const serviceEnd = new Date(`2000-01-01T${serviceEndTime}`);
      const eventStart = new Date(`2000-01-01T${eventStartTime}`);
      const eventEnd = new Date(`2000-01-01T${eventEndTime}`);




      // Servicio inicia antes del rango del evento
      if (serviceStart < eventStart) {
        return { serviceStartsBeforeEvent: true };
      }
      
      //Servicio termina despues del rango del evento
      if (serviceEnd > eventEnd) {
        console.log('serviceEnd>eventEnd: valores -> serviceEnd: ', serviceEnd , " eventEnd: ", eventEnd)
        return { serviceEndsAfterEvent: true };
      }

      // Servicio inicia antes que servicio termine
      if (serviceStart >= serviceEnd) {
        return { invalidServiceTimeRange: true };
      }

      return null;
  
    }
  }


  // Validador asincrono de disponibilidad del venu en cierta fecha

  private venueAvailabilityValidator(): AsyncValidatorFn{
    return (group: AbstractControl) : Observable <ValidationErrors | null> =>{
      const venueId = group.get('selectedVenueId')?.value;
      const date = group.get('date')?.value;

      if(!venueId || !date){
        return of(null);
      }

      return this.venueAvailabilityService.checkVenueAvailability(venueId, date)
      .pipe(map(isAvailable => isAvailable ? null : {venueNotAvailable: true})
    );
    };
  }














}