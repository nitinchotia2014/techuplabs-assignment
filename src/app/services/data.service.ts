import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pin } from '../models/pin.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private pinDataSubject = new BehaviorSubject<Pin[]>([]);
  private customerDataSubject = new BehaviorSubject<Customer[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadCustomerData();
    this.loadPinData();
  }

  getPinData(): Observable<Pin[]> {
    return this.pinDataSubject.asObservable();
  }

  getCustomerData(): Observable<Customer[]> {
    return this.customerDataSubject.asObservable();
  }

  private loadCustomerData(): void {
    const customerData = localStorage.getItem('customerData');
    if (customerData) {
      try {
        const parsedData = JSON.parse(customerData);
        this.customerDataSubject.next(parsedData);
      } catch (e) {
        console.error('Error parsing customer data from localStorage', e);
      }
    }
  }

  private loadPinData(): void {
    const pinData = localStorage.getItem('pinData');
    if (pinData) {
      try {
        const parsedData: Pin[] = JSON.parse(pinData);
        const { value: customerData } = this.customerDataSubject;

        const updatedPinData = parsedData.map(({ collaborators, ...pin }) => ({
          ...pin,
          collaborators,
          collaboratorNames: collaborators
            .map((collaboratorId) => {
              const collaborator = customerData.find(
                (customer) => customer.id === collaboratorId
              );
              return collaborator ? collaborator.title : 'Unknown';
            })
            .join(', '),
        }));

        this.pinDataSubject.next(updatedPinData);
      } catch (e) {
        console.error('Error parsing pin data from localStorage', e);
      }
    }
  }

  deletePin(id: string): void {
    const { value: pinData } = this.pinDataSubject;
    const updatedPinData = pinData.filter((pin) => pin.id !== id);
    this.pinDataSubject.next(updatedPinData);

    localStorage.setItem('pinData', JSON.stringify(updatedPinData));
  }

  refreshData(): void {
    this.loadCustomerData();
    this.loadPinData();
  }
}
