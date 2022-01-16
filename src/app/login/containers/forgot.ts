import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';

@Component({
  selector: 'app-forgot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <form fxLayout="row" [formGroup]="form" (ngSubmit)="onSubmit(form)">
    <mat-card fxFlex>
      <mat-card-header>
        <mat-card-title> forget：</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field class="full-width">
          <input matInput placeholder="email" formControlName="email">
        </mat-form-field>
        <button mat-raised-button type="submit" [disabled]="!form.valid">get password</button>
      </mat-card-content>
      <mat-card-actions class="text-right">
        <p>No account？ <a routerLink="/register">register</a></p>
        <p>Have account <a routerLink="/login">login</a></p>
      </mat-card-actions>
    </mat-card>
  </form>
  `,
  styles: [`
    .text-right {
      margin: 10px;
      text-align: end;
    }
  `]
})
export class ForgotComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder,
    private store$: Store<fromRoot.State>) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required]
    });
  }

  onSubmit({ value, valid }: FormGroup) {
    if (!valid) {
      return;
    }
  }
}
