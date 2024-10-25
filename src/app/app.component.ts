import { Component, OnInit, inject, signal } from '@angular/core';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { SharedModalComponent } from './shared-modal/shared-modal.component';
import { CommonModule, NgFor } from '@angular/common';
import { DataService } from './services/data.service';
import { Pin } from './models/pin.model';
import { Customer } from './models/customer.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ModalModule, SharedModalComponent, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  modalRef?: BsModalRef;

  // Signals for reactive state management
  pinData = signal<Pin[]>([]);
  customerData = signal<Customer[]>([]);

  // Inject services
  private modalService = inject(BsModalService);
  private dataService = inject(DataService);

  ngOnInit(): void {
    // Load initial data
    this.dataService.getPinData().subscribe((data) => this.pinData.set(data));
    this.dataService
      .getCustomerData()
      .subscribe((data) => this.customerData.set(data));
  }

  /**
   * Opens the modal to add a new customer or pin
   * @param title The title of the modal to be opened
   */
  add(title: string) {
    this.openModal(title);
  }

  /**
   * Deletes a pin from the data
   * @param pin The pin to be deleted
   */
  delete(pin: Pin) {
    this.dataService.deletePin(pin.id);
  }

  /**
   * Opens the shared modal component
   * @param title The title of the modal
   */
  private openModal(title: string) {
    this.modalRef = this.modalService.show(SharedModalComponent, {
      initialState: {
        modalTitle: title,
      },
      class: 'modal-dialog modal-lg',
    });

    // Refresh data when modal is closed
    this.modalRef.onHide?.subscribe(() => {
      this.dataService.refreshData();
    });
  }
}
