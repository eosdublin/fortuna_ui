import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from "../../util/web3.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  @Input() transactionId;

  public transaction: any;
  public trans: any;

  constructor(public web3Service: Web3Service) {

    web3Service.submitted$.subscribe(value => {
      if (value) {
        this.getTransaction();
      }
    });
  }

  async ngOnInit() {
    if (this.web3Service.accountSubject.getValue().length) this.getTransaction()
  }

  async getTransaction() {
    this.transaction = await this.web3Service.getTransaction(this.transactionId)
    this.web3Service.submittedSubject.next(false)
  }

  async confirmTransaction(id, confirms) {
    await this.web3Service.confirmTransaction(id, confirms);
  }

}
