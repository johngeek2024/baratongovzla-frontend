// src/app/features/admin/components/customers-panel/customers-panel.component.ts

import { Component, computed, effect, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AdminCustomerDetails, CustomerStatus, PurchaseHistoryItem } from '../../models/customer.model';
import { CustomerAdminService } from '../../services/customer-admin.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-customers-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './customers-panel.component.html',
})
export class CustomersPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';

  private customerService = inject(CustomerAdminService);

  // --- State Signals ---
  public allCustomers = signal<AdminCustomerDetails[]>([]);
  public filteredCustomers = signal<AdminCustomerDetails[]>([]);
  public selectedCustomer = signal<AdminCustomerDetails | null>(null);
  public isLoading = signal(true);
  public viewMode = signal<'table' | 'card'>('table');
  public currentView = signal<'dashboard' | 'detail'>('dashboard');
  public activeDetailTab = signal<'summary' | 'history' | 'info'>('summary');
  public isFiltersPanelOpen = signal(false);
  public isAddModalOpen = signal(false);
  public isActionsMenuOpen = signal(false);

  // --- Search & Filters ---
  public searchControl = new FormControl('');
  public statusFilters = signal<CustomerStatus[]>([]);
  public tempStatusFilters = signal<Set<CustomerStatus>>(new Set());
  // ✅ CORRECCIÓN: Se define una propiedad fuertemente tipada para el bucle en la plantilla.
  public readonly statusKeys: CustomerStatus[] = ['vip', 'recurring', 'at-risk', 'new'];


  // --- Computed Stats ---
  public totalClientsStat = computed(() => this.allCustomers().length);
  public recurringClientsStat = computed(() => this.allCustomers().filter(c => c.status === 'recurring').length);
  public vipClientsStat = computed(() => this.allCustomers().filter(c => c.status === 'vip').length);
  public atRiskClientsStat = computed(() => this.allCustomers().filter(c => c.status === 'at-risk').length);
  public purchaseHistory = computed<PurchaseHistoryItem[]>(() => {
    if (!this.selectedCustomer()) return [];
    return this.selectedCustomer()!.events
      .filter(e => e.type === 'purchase')
      .map(e => ({ id: e.id, date: e.date, amount: e.amount!, status: e.status! }));
  });

  constructor() {
    effect(() => {
        const query = (this.searchControl.value || '').toLowerCase();
        const statuses = this.statusFilters();
        const customers = this.allCustomers();

        const filtered = customers.filter(c =>
            (c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)) &&
            (statuses.length === 0 || statuses.includes(c.status))
        );
        this.filteredCustomers.set(filtered);
    });
  }

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe(data => {
      this.allCustomers.set(data);
      this.isLoading.set(false);
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe();
  }

  // --- View Management ---
  selectCustomer(customerId: number): void {
    this.isLoading.set(true);
    this.customerService.getCustomerById(customerId).subscribe(customer => {
      if (customer) {
        this.selectedCustomer.set(customer);
        this.currentView.set('detail');
        this.activeDetailTab.set('summary');
      }
      this.isLoading.set(false);
    });
  }

  backToDashboard(): void {
    this.currentView.set('dashboard');
    this.selectedCustomer.set(null);
  }

  // --- UI Actions ---
  setViewMode(mode: 'table' | 'card'): void { this.viewMode.set(mode); }
  setActiveDetailTab(tab: 'summary' | 'history' | 'info'): void { this.activeDetailTab.set(tab); }
  toggleActionsMenu(): void { this.isActionsMenuOpen.update(v => !v); }

  openFiltersPanel(): void {
    this.tempStatusFilters.set(new Set(this.statusFilters()));
    this.isFiltersPanelOpen.set(true);
  }

  closeFiltersPanel(): void {
    this.isFiltersPanelOpen.set(false);
  }

  toggleAddModal(): void { this.isAddModalOpen.update(v => !v); }

  toggleStatusFilter(status: CustomerStatus): void {
    this.tempStatusFilters.update(currentSet => {
        currentSet.has(status) ? currentSet.delete(status) : currentSet.add(status);
        return new Set(currentSet);
    });
  }

  applyFilters(): void {
    this.statusFilters.set(Array.from(this.tempStatusFilters()));
    this.closeFiltersPanel();
  }

  resetFilters(): void {
    this.tempStatusFilters.set(new Set());
  }

  // --- Helpers ---
  getAvatarInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getStatusBadge(status: CustomerStatus): { text: string; icon: string; color: string } {
    const statusMap = {
      vip: { text: 'VIP', icon: 'fa-crown', color: 'yellow' },
      recurring: { text: 'Recurrente', icon: 'fa-sync-alt', color: 'green' },
      'at-risk': { text: 'En Riesgo', icon: 'fa-exclamation-triangle', color: 'orange' },
      new: { text: 'Nuevo', icon: 'fa-star', color: 'blue' }
    };
    return statusMap[status];
  }

  getEventType(type: string): { icon: string; color: string } {
    const typeMap = {
        purchase: { icon: 'fa-shopping-cart', color: 'blue' },
        support: { icon: 'fa-headset', color: 'orange' },
        review: { icon: 'fa-star', color: 'yellow' },
        account: { icon: 'fa-user-check', color: 'green' }
    };
    return (typeMap as any)[type];
  }
}
