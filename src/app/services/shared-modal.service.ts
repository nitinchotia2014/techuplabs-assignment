import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Region } from '../models/region.model';
import { Customer } from '../models/customer.model';
import { Pin } from '../models/pin.model';

@Injectable({
  providedIn: 'root',
})
export class SharedModalService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches regions and countries data from the API
   * @returns An observable of Region array
   */
  getRegions(): Observable<Region[]> {
    return this.http.get('https://api.first.org/data/v1/countries').pipe(
      map(({ data }: any) => {
        const regionMap: { [key: string]: string[] } = {};

        // Process the API response to group countries by region
        Object.values(data).forEach(({ region, country }: any) => {
          if (!regionMap[region]) {
            regionMap[region] = [];
          }
          regionMap[region].push(country);
        });

        // Convert the regionMap to an array of Region objects
        return Object.entries(regionMap)
          .map(([region, countries]) => ({
            region,
            countries: countries.sort(),
          }))
          .sort((a, b) => a.region.localeCompare(b.region));
      })
    );
  }

  /**
   * Uploads a file to the server
   * @param file The file to be uploaded
   * @returns An observable of the uploaded image ID
   */
  uploadFile(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post<{ id: number }>('http://localhost:3000/api/upload', formData)
      .pipe(map((response) => response.id));
  }

  /**
   * Saves customer data to local storage
   * @param formData The customer data to be saved
   */
  saveCustomerData(formData: Customer): void {
    const existingData = localStorage.getItem('customerData');
    let dataArray: Customer[] = existingData ? JSON.parse(existingData) : [];
    dataArray.push(formData);
    localStorage.setItem('customerData', JSON.stringify(dataArray));
  }

  /**
   * Saves pin data to local storage
   * @param formData The pin data to be saved
   */
  savePinData(formData: Pin): void {
    const existingData = localStorage.getItem('pinData');
    let dataArray: Pin[] = existingData ? JSON.parse(existingData) : [];
    dataArray.push(formData);
    localStorage.setItem('pinData', JSON.stringify(dataArray));
  }

  /**
   * Retrieves customer data from local storage
   * @returns An array of Customer objects
   */
  getCustomerData(): Customer[] {
    const data = localStorage.getItem('customerData');
    return data ? JSON.parse(data) : [];
  }
}
