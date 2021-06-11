import {Component, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';

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
  public lowBalance = false;
  public approving = false;
  public stakeBtn = 'Stake'
  public APY: any = 0;
  public reawardPeriodEnds = false

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

    web3Service.submitted$.subscribe(value => {
      if (value) {
        this.getAPY();
      }
    });

    window.addEventListener('load', (event) => {
      this.getTotalStaked();
      this.getRewardPull();
      this.getTimer();
      this.getAPY()
    });

    web3Service.accountSubject.subscribe(accs => {
      if (accs.length) {
        this.getYourStake(accs[0]);
        this.getYourReward(accs[0]);
        this.balance();
        this.isSigner();
      }
    });

    web3Service.stakeBtnSubject.subscribe(value => this.stakeBtn = value)
  }

  ngOnInit(): void {

  }

  async getTotalStaked() {
    try {
      const total = await this.web3Service.totalStaked();
      this.totalStaked = Number.parseInt(total) / Math.pow(10, 18);
    } catch (err) {
      console.log(err);
    }
  }

  async getYourStake(acc) {
    try {
      this.yourStake = await this.web3Service.yourStake(acc) / Math.pow(10, 18);
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

  async stake() {
    this.checkBalance();
    if (!this.lowBalance) {
      this.approving = true;
      await this.web3Service.stake((this.stakeForm.value.stake * Math.pow(10, 18)).toLocaleString('fullwide', {useGrouping: false}))
        .then(() => {
          this.approving = false;
          location.reload()
        });
    }
  }

  claim() {
    this.web3Service.claim();
  }

  unstake() {
    if (confirm('Are you sure you want to unstake?')) {
      this.web3Service.unstake().then(() => {
        location.reload()
      });
    }
  }

  async isSigner() {
    const res = await this.web3Service.isSigner();
    console.log(res);
    this.signerSubject.next(res);
  }

  async getTimer() {
    let timer = await this.web3Service.getTimer();
    timer.currentPeriod = Number.parseInt(timer.currentPeriod);
    timer.rewardsPeriod = Number.parseInt(timer.rewardsPeriod);
    timer.cooldownPeriod = Number.parseInt(timer.cooldownPeriod);
    let now = Math.round(new Date().getTime() / 1000);
    if (timer && ((timer.currentPeriod + timer.rewardsPeriod) > now)) {
      this.ConvertSecToDay((timer.currentPeriod + timer.rewardsPeriod) - now);
      let t = setInterval(() => {
        if (((timer.currentPeriod + timer.rewardsPeriod) === now)) {
          clearInterval(t)
          this.reawardPeriodEnds = true;
          let t2 = setInterval(() => {
            if (((timer.currentPeriod + timer.rewardsPeriod + timer.cooldownPeriod) === now)) {
              this.reawardPeriodEnds = false;
              clearInterval(t2)
              this.cooldown = 0;
            } else {
              now = now + 1;
              this.ConvertSecToDay((timer.currentPeriod + timer.rewardsPeriod + timer.cooldownPeriod) - now)
            }
          }, 1000)
        } else {
          now = now + 1;
          this.ConvertSecToDay((timer.currentPeriod + timer.rewardsPeriod) - now)
        }
      }, 1000)
    } else {
      this.cooldown = 0;
    }
  }

  ConvertSecToDay(n) {
    var day = Math.floor(n / (3600 * 24));
    var hour = Math.floor(n % (3600 * 24) / 3600);
    var minutes = Math.floor(n % 3600 / 60);
    var seconds = Math.floor(n % 60);

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
    this.yourBalance = await this.web3Service.getBalance() / Math.pow(10, 18);
  }

  async checkBalance() {
    this.lowBalance = this.yourBalance * Math.pow(10, 18) < this.stakeForm.value.stake * Math.pow(10, 18);
  }

  async getAPY() {
    this.APY = await this.web3Service.APY();
    console.log(this.APY)
    this.web3Service.submittedSubject.next(false);
  }

}
