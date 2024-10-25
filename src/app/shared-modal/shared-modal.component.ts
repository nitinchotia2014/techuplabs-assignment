import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'ng2-file-upload';
import { NgxSelectModule } from 'ngx-select-ex';
import { SharedModalService } from '../services/shared-modal.service';
import { Region } from '../models/region.model';
import { Customer } from '../models/customer.model';
import { Pin } from '../models/pin.model';

@Component({
  selector: 'app-shared-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FileUploadModule,
    NgxSelectModule,
  ],
  templateUrl: './shared-modal.component.html',
  styleUrls: ['./shared-modal.component.scss'],
})
export class SharedModalComponent implements OnInit, OnDestroy {
  @Input() modalTitle: string = '';
  customerForm: FormGroup;
  pinForm: FormGroup;

  // Signals for reactive state management
  regions = signal<Region[]>([]);
  customerData = signal<Customer[]>([]);
  selectedFile = signal<File | null>(null);
  uploadedImageId = signal<number | null>(null);
  isUploading = signal<boolean>(false);
  previewUrl = signal<string | null>(null);
  selectedRegion = signal<string>('');

  // Computed signal for filtering countries based on selected region
  countriesForSelectedRegion = computed(() => {
    const region = this.regions().find(
      (r) => r.region === this.selectedRegion()
    );
    return region ? region.countries : [];
  });

  constructor(
    public modalRef: BsModalRef,
    private fb: FormBuilder,
    private sharedModalService: SharedModalService
  ) {
    // Initialize forms
    this.customerForm = this.fb.group({
      title: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      region: ['', Validators.required],
      country: ['', Validators.required],
    });
    this.pinForm = this.fb.group({
      title: ['', Validators.required],
      collaborators: ['', Validators.required],
      privacy: ['public', Validators.required],
    });
  }

  ngOnInit(): void {
    this.customerData.set(this.sharedModalService.getCustomerData());
    this.getRegions();

    // Subscribe to region changes to update country options
    this.customerForm.get('region')?.valueChanges.subscribe((region) => {
      this.selectedRegion.set(region);
      this.customerForm.get('country')?.setValue('');
    });
  }

  /**
   * Fetches regions and countries data from the API
   */
  getRegions() {
    this.sharedModalService.getRegions().subscribe(
      (regions) => {
        this.regions.set(regions);
        console.log('Regions loaded:', regions);
      },
      (error) => {
        console.error('Error fetching regions', error);
      }
    );
  }

  /**
   * Handles customer form submission
   */
  onCustomerSubmit() {
    if (this.customerForm.valid) {
      const uniqueId = `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const formData: Customer = {
        id: uniqueId,
        ...this.customerForm.value,
      };
      this.sharedModalService.saveCustomerData(formData);
      this.modalRef.hide();
    }
  }

  /**
   * Handles pin form submission
   */
  onPinSubmit() {
    const file = this.selectedFile();
    if (this.pinForm.valid && file) {
      this.isUploading.set(true);
      this.uploadFile(file);
    }
  }

  /**
   * Checks if the local storage contains an array for a given key
   * @param key The key to check
   * @returns True if the data is an array, false otherwise
   */
  checkLocalStorageForArray(key: string): boolean {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        this.customerData.set(parsedData);
        return Array.isArray(parsedData);
      } catch (e) {
        console.error('Error parsing data from localStorage', e);
        return false;
      }
    }
    return false;
  }

  /**
   * Handles the drag over event
   * @param event The drag over event
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.add('dragover');
  }

  /**
   * Handles the drag leave event
   * @param event The drag leave event
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('dragover');
  }

  /**
   * Handles the drop event
   * @param event The drop event
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('dragover');

    const { dataTransfer } = event;
    if (dataTransfer?.files && dataTransfer.files.length > 0) {
      this.onFileSelected({ target: { files: dataTransfer.files } } as any);
    }
  }

  /**
   * Handles the file selection event
   * @param event The file selection event
   */
  onFileSelected(event: any) {
    const { files } = event.target;
    const file = files[0];
    if (file) {
      this.selectedFile.set(file);
      this.createPreviewUrl(file);
    }
  }

  /**
   * Creates a preview URL for the selected file
   * @param file The file to create a preview URL for
   */
  createPreviewUrl(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl.set(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Uploads the selected file to the server
   * @param file The file to be uploaded
   */
  uploadFile(file: File) {
    this.isUploading.set(true);
    this.sharedModalService.uploadFile(file).subscribe(
      (uploadedImageId) => {
        this.uploadedImageId.set(uploadedImageId);
        console.log('File uploaded successfully');
        this.isUploading.set(false);

        const uniqueId = `id-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;
        const { value: formValue } = this.pinForm;
        const formData: Pin = {
          id: uniqueId,
          ...formValue,
          imageId: this.uploadedImageId(),
          fileName: this.selectedFile()?.name,
        };
        this.sharedModalService.savePinData(formData);
        this.modalRef.hide();
      },
      (error) => {
        console.error('Error uploading file', error);
        this.isUploading.set(false);
      }
    );
  }

  /**
   * Handles the region change event
   */
  onRegionChange() {
    this.customerForm.get('country')?.setValue('');
  }

  /**
   * Cleans up the object URL to prevent memory leaks
   */
  ngOnDestroy() {
    const previewUrl = this.previewUrl();
    if (previewUrl && typeof previewUrl === 'string') {
      URL.revokeObjectURL(previewUrl);
    }
  }
}
