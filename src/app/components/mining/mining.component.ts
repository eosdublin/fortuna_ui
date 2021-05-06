import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mining',
  templateUrl: './mining.component.html',
  styleUrls: ['./mining.component.scss']
})
export class MiningComponent implements OnInit {

  public cooldown: any = 0;
  public totalStaked = 0;
  public yourStake: any;
  public yourReward: any;
  public rewardPull: any;
  public signerSubject: BehaviorSubject<any> = new BehaviorSubject(false);
  public signer$: Observable<any> = this.signerSubject.asObservable();
  public stakeForm: FormGroup;
  public canClaim = false;
  public yourBalance = 0;

  constructor(
    private web3Service: Web3Service,
    private router: Router
  ) {
    this.stakeForm = new FormGroup({
      'stake': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ])
    });

    window.addEventListener('load', (event) => {
      this.getTotalStaked();
      this.getRewardPull();
      this.getTimer();
    });

    web3Service.accountSubject.subscribe(accs => {
      if (accs.length) {
        this.getYourStake(accs[0]);
        this.getYourReward(accs[0]);
        this.balance();
        this.isSigner();
      }
    });
  }

  ngOnInit(): void {

  }

  async getTotalStaked() {
    try {
      const total = await this.web3Service.totalStaked();
      this.totalStaked = Number.parseInt(total);
    } catch (err) {
      console.log(err);
    }
  }

  async getYourStake(acc) {
    try {
      this.yourStake = await this.web3Service.yourStake(acc);
    } catch (err) {
      console.log(err);
    }
  }

  async getYourReward(acc) {
    try {
      this.yourReward = await this.web3Service.yourReward(acc);
    } catch (err) {
      console.log(err);
    }
  }

  async getRewardPull() {
    this.rewardPull = await this.web3Service.rewardPull();
  }

  stake() {
    console.log((this.stakeForm.value.stake * Math.pow(10, 18)).toLocaleString('fullwide', {useGrouping:false}));
    this.web3Service.stake((this.stakeForm.value.stake * Math.pow(10, 18)).toLocaleString('fullwide', {useGrouping:false}));
  }

  claim() {
    this.web3Service.claim();
  }

  unstake() {
    if (confirm('Are you sure you want to unstake?')) {
      this.web3Service.unstake();
    }
  }

  async isSigner() {
    const res = await this.web3Service.isSigner();
    console.log(res);
    this.signerSubject.next(res);
  }

  async getTimer() {
    let timer = await this.web3Service.getTimer();
    timer = Number.parseInt(timer);
    const now = Math.round(new Date().getTime() / 1000);
    if (timer && ((timer + 7776000) > now)) {
      this.ConvertSecToDay((timer + 7776000) - now);
    } else {
      this.cooldown = 0;
    }
  }

  ConvertSecToDay(n) {
    const day = n / (24 * 3600);

    n = n % (24 * 3600);
    const hour = n / 3600;

    n %= 3600;
    const minutes = n / 60;

    n %= 60;
    const seconds = n;

    this.cooldown = {
      days: day.toFixed(),
      hours: hour.toFixed(),
      minutes: minutes.toFixed(),
      seconds: seconds.toFixed()
    };
  }

  toTransactions() {
    this.router.navigate(['transactions']);
  }

  async balance() {
    this.yourBalance = await this.web3Service.getBalance();
  }

}
