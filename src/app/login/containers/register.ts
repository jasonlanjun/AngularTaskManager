import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import * as fromRoot from '../../reducers';
import * as actions from '../../actions/auth.action';
import {extractInfo, getAddrByCode, isValidAddr} from '../../utils/identity.util';
import {isValidDate} from '../../utils/date.util';
import { range } from 'rxjs/observable/range';
import { map, reduce, debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  template: `
  <form fxFlex fxLayout="row" fxLayout.xs="column" fxLayoutAlign="center stretch" [formGroup]="form" (ngSubmit)="onSubmit(form, $event)">
    <mat-card fxFlex="1 1 auto">
      <mat-tab-group [dynamicHeight]="true" [selectedIndex]="selectedTab" (selectChange)="onTabChange($event.index)">
        <mat-tab label="account">
          <mat-form-field class="full-width">
            <input matInput placeholder="email" formControlName="email">
          </mat-form-field>
          <mat-form-field class="full-width">
            <input matInput type="text" placeholder="name" formControlName="name">
          </mat-form-field>
          <mat-form-field class="full-width">
            <input matInput type="password" placeholder="password" formControlName="password">
          </mat-form-field>
          <mat-form-field class="full-width">
            <input matInput type="password" placeholder="confirm" formControlName="repeat">
          </mat-form-field>
          <app-image-list-select
            [useSvgIcon]="true"
            [cols]="6"
            [title]="'avatar：'"
            [items]="avatars$ | async"
            formControlName="avatar">
          </app-image-list-select>
          <div class="full-width" fxLayout="row">
            <button mat-raised-button type="button" (click)="nextTab()">next</button>
            <span class="fill-remaining-space"></span>
            <span>
              <span>account？ <a routerLink="/login">login</a></span>
              <span><a routerLink="/forgot">forget passowrd？</a></span>
            </span>
          </div>
        </mat-tab>
        <mat-tab label="profile">
          <app-indentity-input formControlName="identity" class="full-width control-padding">
          </app-indentity-input>
          <div class="full-width control-padding">
            <app-area-list formControlName="address"></app-area-list>
          </div>
          <div class="full-width" fxLayout="row">
            <button mat-raised-button type="button" (click)="prevTab()">previous</button>
            <button mat-raised-button type="submit" [disabled]="!form.valid">registration</button>
            <span class="fill-remaining-space"></span>
            <span>
              <span>account？ <a routerLink="/login">login</a></span>
              <span> <a routerLink="/forgot">forget password？</a></span>
            </span>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-card>
  </form>
  `,
  styles: [`
    .text-right {
      margin: 10px;
      text-align: end;
    }

    .control-padding{
      margin-top: 10px;
      padding-top: 10px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit, OnDestroy {

  selectedTab = 0;
  form: FormGroup;
  avatars$: Observable<string[]>;
  private _sub: Subscription;
  private readonly avatarName = 'avatars';

  constructor(private fb: FormBuilder,
              private store$: Store<fromRoot.State>) {

    this.avatars$ = range(1, 16)
      .pipe(
        map(i => `${this.avatarName}:svg-${i}`),
        reduce((r: string[], x: string) => [...r, x], [])
      );
  }

  ngOnInit() {
    const img = `${this.avatarName}:svg-${(Math.random() * 16).toFixed()}`;
    this.form = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      repeat: ['', Validators.required],
      avatar: [img],
      dateOfBirth: [''],
      address: ['', Validators.maxLength(80)],
      identity: []
    });
    const identity = this.form.get('identity');
    if (!identity) {
      return;
    }
    const id$ = identity.valueChanges
      .pipe(
        debounceTime(300),
        filter(v => identity.valid)
      );

    this._sub = id$.subscribe(id => {
      const info = extractInfo(id.identityNo);
      if (isValidAddr(info.addrCode)) {
        const addr = getAddrByCode(info.addrCode);
        this.form.patchValue({address: addr});
        this.form.updateValueAndValidity({onlySelf: true, emitEvent: true});
      }
      if (isValidDate(info.dateOfBirth)) {
        const date = info.dateOfBirth;
        this.form.patchValue({dateOfBirth: date});
        this.form.updateValueAndValidity({onlySelf: true, emitEvent: true});
      }
    });
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
    }
  }

  onSubmit({value, valid}: FormGroup, e: Event) {
    e.preventDefault();
    if (!valid) {
      return;
    }
    this.store$.dispatch(
      new actions.RegisterAction({
        id: undefined,
        password: value.password,
        name: value.name,
        email: value.email,
        avatar: value.avatar,
        identity: value.identity,
        address: value.address,
        dateOfBirth: value.dateOfBirth
      }));
  }

  prevTab() {
    this.selectedTab = 0;
  }

  nextTab() {
    this.selectedTab = 1;
  }

  onTabChange(index: number) {
    this.selectedTab = index;
  }
}
