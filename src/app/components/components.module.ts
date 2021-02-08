import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule }   from '@angular/forms';

import {HeaderComponent} from "./header/header.component";
import {TransactionsComponent} from "./transactions/transactions.component";



@NgModule({
  declarations: [
    HeaderComponent,
    TransactionsComponent,
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    HeaderComponent,
    TransactionsComponent
  ]
})
export class ComponentsModule { }
