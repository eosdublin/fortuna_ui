import { Component } from '@angular/core';
import { Web3Service } from "../../util/web3.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  public toggle: boolean = true;
  public ifConnected: boolean = false;
  public accAddress: string
  public transForm : FormGroup;

  constructor(public web3Service: Web3Service) {
    this.transForm = new FormGroup({
      "type": new FormControl('Mint for', [Validators.required]),
      "receiver": new FormControl(null, [Validators.pattern('^0x[a-fA-F0-9]{40}$')]),
      "amount": new FormControl(0),
      "prevSigner": new FormControl(null, [Validators.pattern('^0x[a-fA-F0-9]{40}$')]),
      "newSigner": new FormControl(null, [Validators.pattern('^0x[a-fA-F0-9]{40}$')])
    });

    web3Service.accountSubject.subscribe(accs => {
      if (accs.length) {
        this.ifConnected = true
        this.accAddress = accs[0]
      } else this.ifConnected = false
    })
  }

  connect() {
    this.web3Service.bootstrapWeb3();
  }

  async submitTransaction() {
    console.log(this.transForm.value.receiver, "One");
    console.log(this.transForm.value.type, "Two");
    console.log(this.transForm.value.amount, "Three");

    if (this.transForm.value.type === 'Mint for') {
      await this.web3Service.submitTransaction({
        type: this.transForm.value.type,
        receiver: this.transForm.value.receiver,
        amount: (this.transForm.value.amount * Math.pow(10, 10)).toString(),
        str: this.transForm.value.type + ',' + this.transForm.value.receiver + ',' + this.transForm.value.amount
      });
    } else if (this.transForm.value.type === 'Burn from') {
      console.log("Here", "Four");
      await this.web3Service.submitTransaction({
        type: this.transForm.value.type,
        receiver: this.transForm.value.receiver,
        amount: (this.transForm.value.amount * Math.pow(10, 10)).toString(),
        str: this.transForm.value.type + ',' + this.transForm.value.receiver + ',' + this.transForm.value.amount
      })
    } else if (this.transForm.value.type === 'Replace signer') {
      await this.web3Service.submitTransaction({
        type: this.transForm.value.type,
        prevSigner: this.transForm.value.prevSigner,
        newSigner: this.transForm.value.newSigner,
        amount: 0,
        str: this.transForm.value.type + ',' + this.transForm.value.prevSigner + ',' + this.transForm.value.newSigner
      })
    } else {
      console.log("NOT Here", "Four");
      await this.web3Service.submitTransaction({
        type: this.transForm.value.type,
        receiver: this.transForm.value.receiver,
        amount: (this.transForm.value.amount * Math.pow(10, 18)).toString(),
        str: this.transForm.value.type + ',' + this.transForm.value.receiver + ',' + this.transForm.value.amount
      })
    }

    this.transForm.setValue({
      type: 'Mint for',
      receiver: null,
      amount: 0,
      prevSigner: null,
      newSigner: null
    })
  }

}
