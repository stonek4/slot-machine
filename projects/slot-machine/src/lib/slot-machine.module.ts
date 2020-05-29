import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SlotMachineComponent } from './slot-machine.component';
import { PaylineComponent } from './payline/payline.component';

@NgModule({
  declarations: [
    SlotMachineComponent,
    PaylineComponent
  ],
  imports: [
    BrowserModule
  ],
  exports: [SlotMachineComponent]
})
export class SlotMachineModule { }
