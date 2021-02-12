import {Component, OnInit} from '@angular/core';
import { Web3Service } from '../../util/web3.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  public transactionsSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public transactions$: Observable<any[]> = this.transactionsSubject.asObservable();
  public accounts = [];
  public pagiId = 0;
  public maxPages: number;

  constructor(public web3Service: Web3Service) {

    web3Service.submitted$.subscribe(value => {
      if (value) {
        this.getTransactions(0);
      }
    });

    web3Service.accountsObservable.subscribe(value => {
      if (value.length) {
        this.accounts = value;
        this.getTransactions(0);
      }
    });

    window.addEventListener('load', (event) => {
      this.getTransactions(0);
    });

  }

  ngOnInit(): void {
  }

  async getTransactions(pagi) {
    this.pagiId = pagi;
    this.maxPages = this.web3Service.showPagiSubject.getValue().length - 1;
    try {
      const transactions = await this.web3Service.getTransactions(pagi);
      this.transactionsSubject.next(transactions);
    } catch (e) {
      console.log(e);
      this.transactionsSubject.next([]);
    }
    this.web3Service.submittedSubject.next(false);
  }

  confirmTransaction(id, confirms) {
    this.web3Service.confirmTransaction(id, confirms);
  }

}
