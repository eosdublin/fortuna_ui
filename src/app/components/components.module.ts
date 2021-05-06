import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule }   from '@angular/forms';

import {HeaderComponent} from "./header/header.component";
import {TransactionsComponent} from "./transactions/transactions.component";
import { TransactionComponent } from './transaction/transaction.component';
import {RouterModule} from "@angular/router";
import { ModalContainerComponent } from './modal-container/modal-container.component';
import { MiningComponent } from './mining/mining.component';



@NgModule({
  declarations: [
    HeaderComponent,
    TransactionsComponent,
    TransactionComponent,
    ModalContainerComponent,
    MiningComponent,
  ],
  imports: [
      CommonModule,
      NgSelectModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule
  ],
  exports: [
    HeaderComponent,
    TransactionsComponent
  ],
  entryComponents: [
    TransactionComponent
  ]
})
export class ComponentsModule { }
