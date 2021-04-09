import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from './components/components.module';
import { CommonModule } from '@angular/common';
import { UtilModule } from './util/util.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { ModalContainerComponent } from './components/modal-container/modal-container.component';
import { MiningComponent } from './components/mining/mining.component';
import { TransactionsComponent } from './components/transactions/transactions.component';

const routes: Routes = [
  { path: 'transaction/:id', component: ModalContainerComponent },
  { path: '', component: TransactionsComponent },
  { path: 'liquidity-mining', component: MiningComponent }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    UtilModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
