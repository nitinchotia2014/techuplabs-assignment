import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ModalModule.forRoot()),
    importProvidersFrom(HttpClientModule),
  ],
}).catch((err) => console.error(err));
