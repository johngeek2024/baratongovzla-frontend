import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CustomerAdminService } from '../../services/customer-admin.service';

// Interfaz para los datos del cliente
export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  registeredDate: string;
  orderCount: number;
}

@Component({
  selector: 'app-customers-panel',
  standalone: true,
  imports: [CommonModule, DatePipe], // Importamos DatePipe
  templateUrl: './customers-panel.component.html',
})
export class CustomersPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';
  private customerAdminService = inject(CustomerAdminService);

  customers = signal<AdminCustomer[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.isLoading.set(true);
    this.customerAdminService.getCustomers().subscribe(data => {
      this.customers.set(data);
      this.isLoading.set(false);
    });
  }
}
