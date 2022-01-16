import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Store, select} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import * as fromRoot from '../../reducers';
import * as authActions from '../../actions/auth.action';


@Component({
  selector: 'app-login',
  template: `
  <form fxLayout="row" fxLayout.xs="column" fxLayoutAlign="center" [formGroup]="form" (ngSubmit)="onSubmit(form, $event)">
    <mat-card fxFlex="0 1 20rem">
      <mat-card-header>
        <mat-card-title> login：</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field class="full-width">
          <input matInput type="text" placeholder="email" formControlName="email">
          <mat-error>required</mat-error>
        </mat-form-field>
        <mat-form-field class="full-width">
          <input matInput type="password" placeholder="password" formControlName="password">
          <mat-error>invalid</mat-error>
        </mat-form-field>
        <button mat-raised-button type="submit" [disabled]="!form.valid">login</button>
      </mat-card-content>
      <mat-card-actions class="text-right">
        <p>account？ <a routerLink="/register">register</a></p>
        <p><a routerLink="/forgot">forget password？</a></p>
      </mat-card-actions>
    </mat-card>
   </form>
  `,
  styles: [`
  .text-right {
    margin: 10px;
    text-align: end;
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  form: FormGroup;


  constructor(private fb: FormBuilder,
              private store$: Store<fromRoot.State>) {

  }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['Junlan2015@gmail.com', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.required]
    });
   
  }

  onSubmit({value, valid}: FormGroup, e: Event) {
    e.preventDefault();
    if (!valid) {
      return;
    }
    this.store$.dispatch(
      new authActions.LoginAction(value));
  }
}
