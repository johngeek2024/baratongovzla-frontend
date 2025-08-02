import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdminCustomer } from '../components/customers-panel/customers-panel.component';

@Injectable({
  providedIn: 'root'
})
export class CustomerAdminService {
  private apiUrl = 'https://baratongovzla.com/api/admin/customers';

  // SIMULACIÓN DE API
  getCustomers(): Observable<AdminCustomer[]> {
    const mockCustomers: AdminCustomer[] = [
      { id: 'cust-1', name: 'Aura', email: 'aura.designer@email.com', registeredDate: '2025-07-10', orderCount: 1 },
      { id: 'cust-2', name: 'Carlos R.', email: 'carlos.r@email.com', registeredDate: '2025-06-05', orderCount: 3 },
      { id: 'cust-3', name: 'Elena G.', email: 'elena.g@email.com', registeredDate: '2025-07-09', orderCount: 2 },
      { id: 'cust-4', name: 'Luis M.', email: 'luis.m@email.com', registeredDate: '2025-05-01', orderCount: 5 },
    ];
    return of(mockCustomers).pipe(delay(600)); // Simula latencia de red
  }
}
