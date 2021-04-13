import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ActivatedRoute, Router } from '@angular/router';
import { Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TransactionComponent } from '../transaction/transaction.component';

@Component({
  selector: 'app-modal-container',
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss']
})
export class ModalContainerComponent implements OnDestroy, OnInit {

  private destroy = new Subject<any>();
  private currentDialog = null;

  constructor(private modalService: NgbModal,
              private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
      this.currentDialog = this.modalService.open(TransactionComponent, {centered: true, size: 'lg'});
      this.currentDialog.componentInstance.transactionId = params.id;

      this.currentDialog.result.then(result => {
        this.router.navigateByUrl('/transactions');
      }, reason => {
        this.router.navigateByUrl('/transactions');
      });
    });
  }

  ngOnDestroy() {
    this.destroy.next();
  }

}
