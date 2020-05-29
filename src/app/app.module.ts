import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SlotMachineModule } from 'slot-machine';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SlotMachineModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
