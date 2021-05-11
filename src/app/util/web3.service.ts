import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import WNDAU from '../abi/wNDAU.json';
import multsigWallet from '../abi/MultiSigWallet.json';
import IERC20 from '../abi/IERC20.json';
import Staking from '../abi/Staking.json';

import config from '../configs/config.json';

const Web3 = require('web3');
const contract = require('@truffle/contract');

const abi = require('../abi/abi.json');
const stakingAbi = require('../abi/StakingAbi.json');
const ierc20Abi = require('../abi/ierc20Abi.json');
const wndauAbi = require('../abi/wndauAbi.json');

declare let require: any;
declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  public contract: any;
  public refresh: any;
  private tumbler = true;

  public accountSubject: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public accountsObservable: Observable<any> = this.accountSubject.asObservable();

  public transCountSubject: BehaviorSubject<any>;
  public transCount$: Observable<any>;

  public submittedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public submitted$: Observable<boolean> = this.submittedSubject.asObservable();

  public showPagiSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public showPagi$: Observable<any[]> = this.showPagiSubject.asObservable();

  constructor() {
    window.addEventListener('load', (event) => {
      this.web3 = new Web3(window.ethereum);
      this.refresh = setInterval(() => this.refreshAccounts(), 100);
    });

    this.transCountSubject = new BehaviorSubject(0);
    this.transCount$ = this.transCountSubject.asObservable();
  }

  public async bootstrapWeb3() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      window.ethereum.request({method: 'eth_requestAccounts'});
    } else {
      this.web3 = new Web3(window.web3.currentProvider);
    }

    const accs = await window.ethereum.request({method: 'eth_requestAccounts'});
    this.accountSubject.next(accs);

    await this.loadContract();
  }

  disconnect() {
    clearInterval(this.refresh);
    this.accountSubject.next([]);
  }

  async reconnect(tumbler) {
    this.tumbler = tumbler;
    await this.web3.eth.net.getNetworkType()
      .then(console.log);
    this.bootstrapWeb3();
  }

  public async loadContract() {
    this.contract = new this.web3.eth.Contract(abi, this.tumbler ? config.mainNetMultisig : config.testNetMultisig);
    return contract;
  }

  public async getTransaction(id) {
    const transaction = await this.contract.methods.transactions(id).call();
    const confirmations = await this.contract.methods.getConfirmationCount(id).call();
    const txinfo = transaction[0].split(',');
    return {
      type: txinfo[0],
      account: txinfo[1],
      // tslint:disable-next-line:max-line-length
      amount: (txinfo[0] === 'Mint for' || txinfo[0] === 'Burn from') ? txinfo[2] + ' wNDAU' : (txinfo[0] === 'Return deposit' ? txinfo[2] + ' ETH' : txinfo[2]),
      confirmations: confirmations,
      id: id,
      executed: transaction.executed
    };
  }

  public async getTransactions(pagiNum) {
    await this.loadContract();

    const pendingCount = await this.contract.methods.getPendingTransactionCount().call();
    this.transCountSubject.next(pendingCount);

    let transCount = await this.contract.methods.transactionCount().call();
    transCount = Number.parseInt(transCount);

    const trans = [];

    if (transCount > 20) {

      const pagi = [];
      let count = 1;
      let pagiIds = [];

      for (let i = 1; i <= transCount; i++) {
        pagiIds.push(transCount - i);

        if (i % 20 === 0) {
          pagi.push({
            pagiText: `${count}-${i}`,
            pagiIds: pagiIds,
            active: pagiNum
          });
          count = i + 1;
          pagiIds = [];
        } else if (i % 20 !== 0 && i === transCount) {
          pagi.push({
            pagiText: `${count}-${i}`,
            pagiIds: pagiIds,
            active: pagiNum
          });
        }
      }

      this.showPagiSubject.next(pagi);

      for (const id of this.showPagiSubject.getValue()[pagiNum].pagiIds) {
        const transaction = await this.contract.methods.transactions(id).call();
        const confirmations = await this.contract.methods.getConfirmationCount(id).call();
        const txinfo = transaction[0].split(',');
        trans.push({
          type: txinfo[0],
          account: txinfo[1],
          // tslint:disable-next-line:max-line-length
          amount: (txinfo[0] === 'Mint for' || txinfo[0] === 'Burn from') ? txinfo[2] + ' wNDAU' : (txinfo[0] === 'Return deposit' ? txinfo[2] + ' ETH' : txinfo[2]),
          confirmations: confirmations,
          id: id,
          executed: transaction.executed
        });
      }
    } else {
      for (let id = transCount - 1; id >= 0; id--) {
        const transaction = await this.contract.methods.transactions(id).call();
        const confirmations = await this.contract.methods.getConfirmationCount(id).call();
        const txinfo = transaction[0].split(',');
        trans.push({
          type: txinfo[0],
          account: txinfo[1],
          // tslint:disable-next-line:max-line-length
          amount: (txinfo[0] === 'Mint for' || txinfo[0] === 'Burn from') ? txinfo[2] + ' wNDAU' : (txinfo[0] === 'Return deposit' ? txinfo[2] + ' ETH' : txinfo[2]),
          confirmations: confirmations,
          id: id,
          executed: transaction.executed
        });
      }
    }

    return trans;
  }

  public async submitTransaction(formData) {
    console.log(formData.type, 1);
    console.log(formData.receiver, 2);
    console.log(formData.amount, 3);
    console.log(formData.str, 4);
    const data = await this.askQuestions(formData);
    console.log(data, 5);
    let addr = null;

    if (this.tumbler && formData) {
      addr = (formData.type === 'Mint for' || formData.type === 'Burn from') ? config.mainNetToken : config.mainNetMultisig;
    } else {
      addr = (formData.type === 'Mint for' || formData.type === 'Burn from') ? config.testNetToken : config.testNetMultisig;
    }

    if (formData.type === 'Set rewards') {
      addr = config.stacking
    }

    try {
      const gas = await this.contract.methods.submitTransaction(formData.str, addr, 0, data)
        .estimateGas({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice});
      await this.contract.methods.submitTransaction(formData.str, addr, 0, data)
        .send({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice, gas: gas});
      this.submittedSubject.next(true);
    } catch (e) {
      console.log(e);
    }

  }

  public async confirmTransaction(id, confirms) {
    try {
      let gas = await this.contract.methods.confirmTransaction(id)
        .estimateGas({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice});

      if (confirms.toString() >= '2') {
        gas = 260000;
      }
      await this.contract.methods.confirmTransaction(id)
        .send({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice, gas: gas});
      this.submittedSubject.next(true);
    } catch (e) {
      console.log(e);
    }
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;
  }

  private async refreshAccounts() {
    const accs = await this.web3.eth.getAccounts();

    await this.loadContract();

    if (accs.length === 0) {
      console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
      return;
    }

    // tslint:disable-next-line:max-line-length
    if (!this.accountSubject.getValue() || this.accountSubject.getValue().length !== accs.length || this.accountSubject.getValue()[0] !== accs[0]) {
      console.log('Observed new accounts');
      this.submittedSubject.next(true);

      await this.loadContract();

      this.accountSubject.next(accs);

      this.web3.eth.getBalance(accs[0]).then(console.log);
    }

  }

  async askQuestions(formData) {
    let encodedData;

    const wndau = new this.web3.eth.Contract(WNDAU);
    const multisig = new this.web3.eth.Contract(multsigWallet);
    const staking = new this.web3.eth.Contract(stakingAbi);

    console.log('THERE');
    if (formData.type === 'Mint for') {
      encodedData = await wndau.methods.mintFor(formData.receiver, formData.amount).encodeABI();
    } else if (formData.type === 'Burn from') {
      console.log('THERETHERE');
      encodedData = await wndau.methods.burnFrom(formData.receiver, formData.amount).encodeABI();
    } else if (formData.type === 'Replace signer') {
      encodedData = await multisig.methods.replaceSigner(formData.prevSigner, formData.newSigner).encodeABI();
    } else if (formData.type === 'Set rewards') {
      encodedData = await staking.methods.setNextPeriod().encodeABI();
    } else {
      encodedData = await multisig.methods.returnDeposit(formData.receiver, formData.amount).encodeABI();
    }

    return encodedData;
  }

  async stake (amount) {
    const staking = new this.web3.eth.Contract(stakingAbi, config.stacking);
    const ierc20 = new this.web3.eth.Contract(ierc20Abi, config.IERC20);
    console.log(amount)
    try {
      const gas = await ierc20.methods.approve(config.stacking, amount)
        .estimateGas({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice});
      await ierc20.methods.approve(config.stacking, amount)
        .send({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice, gas: gas}).then(async () => {
          const stakingGas = await staking.methods.stake(amount)
            .estimateGas({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice});
          await staking.methods.stake(amount)
            .send({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice, gas: stakingGas});
        });
    } catch (e) {
      console.log(e);
    }
  }

  async totalStaked() {
    const staking = new this.web3.eth.Contract(stakingAbi, config.stacking);
    const total = await staking.methods.totalStaked().call();
    return total;
  }

  async rewardPull() {
    const wndau = new this.web3.eth.Contract(wndauAbi, config.testNetToken);
    const res = await wndau.methods.balanceOf(config.stacking).call();
    return res / Math.pow(10, 10);
  }

  async yourStake(acc) {
    const staking = new this.web3.eth.Contract(stakingAbi, config.stacking);
    const staked = await staking.methods.staked(acc).call();
    return staked.stakeAmount;
  }

  async yourReward(acc) {
    const staking = new this.web3.eth.Contract(stakingAbi, config.stacking);
    return await staking.methods.calculateUserRewards(acc).call() / Math.pow(10, 10);
  }

  async claim() {
    const staking = new this.web3.eth.Contract(stakingAbi, config.stacking);
    try {
      const gas = await staking.methods.claim()
        .estimateGas({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice});
      await staking.methods.claim()
        .send({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice, gas: gas});
    } catch (e) {
      console.log(e);
    }
  }

  async unstake() {
    const staking = new this.web3.eth.Contract(stakingAbi, config.stacking);
    try {
      const gas = await staking.methods.unstake()
        .estimateGas({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice});
      await staking.methods.unstake()
        .send({from: this.accountSubject.getValue()[0], gasPrice: this.web3.eth.gasPrice, gas: gas});
    } catch (e) {
      console.log(e);
    }
  }

  async getTimer() {
    const staking = new this.web3.eth.Contract(stakingAbi, config.stacking);
    return await staking.methods.currentPeriodStart().call();
  }

  async isSigner() {
    const multisig = new this.web3.eth.Contract(abi, config.testNetMultisig);
    return await multisig.methods.isSigner(this.accountSubject.getValue()[0]).call();
  }

  async getBalance() {
    const ierc20 = new this.web3.eth.Contract(ierc20Abi, config.IERC20);
    return await ierc20.methods.balanceOf(this.accountSubject.getValue()[0]).call();
  }
}
