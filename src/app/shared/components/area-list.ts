import { Component, OnInit, ChangeDetectionStrategy, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { getProvinces, getCitiesByProvince, getAreasByCity } from '../../utils/area.util';
import { Observable } from 'rxjs/Observable';
import { startWith, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Address } from '../../domain';

@Component({
  selector: 'app-area-list',
  template: `
    <div class="address-group">
      <div>
        <mat-form-field>
          <mat-select
            placeholder="Province"
            [(ngModel)]="_address.province"
            (change)="onProvinceChange()">
            <mat-option *ngFor="let p of provinces" [value]="p">
              {{ p }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div>
        <mat-form-field>
          <mat-select
            placeholder="City"
            [(ngModel)]="_address.city"
            (change)="onCityChange()">
            <mat-option *ngFor="let c of cities$ | async" [value]="c">
              {{ c }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div>
        <mat-form-field>
          <mat-select
            placeholder="District"
            [(ngModel)]="_address.district"
            (change)="onDistrictChange()">
            <mat-option *ngFor="let d of districts$ | async" [value]="d">
              {{ d }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="street">
        <mat-form-field class="full-width">
          <input matInput placeholder="Address" [(ngModel)]="_address.street" (change)="onStreetChange()">
        </mat-form-field>
      </div>
    </div>
    `,
  styles: [`
    .street{
      flex: 1 1 100%;
    }
    .address-group{
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      justify-content: space-between;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AreaListComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AreaListComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaListComponent implements ControlValueAccessor, OnInit, OnDestroy {
  _address: Address = {
    province: '',
    city: '',
    district: '',
    street: ''
  };
  _province = new Subject<string>();
  _city = new Subject<string>();
  _district = new Subject<string>();
  _street = new Subject<string>();
  cities$: Observable<string[]>;
  districts$: Observable<string[]>;
  provinces = getProvinces();

  private _sub: Subscription;
  private propagateChange = (_: any) => { };

  constructor() { }

  ngOnInit() {

    const province$ = this._province.asObservable().pipe(startWith(''));
    const city$ = this._city.asObservable().pipe(startWith(''));
    const district$ = this._district.asObservable().pipe(startWith(''));
    const street$ = this._street.asObservable().pipe(startWith(''));
    const val$ = combineLatest([province$, city$, district$, street$], (_p: string, _c: string, _d: string, _s: string) => {
      return {
        province: _p,
        city: _c,
        district: _d,
        street: _s
      };
    });
    this._sub = val$.subscribe(v => {
      this.propagateChange(v);
    });

    this.cities$ = province$.pipe(map(province => getCitiesByProvince(province)));
    this.districts$ = combineLatest(province$, city$, (p, c) => getAreasByCity(p, c));

  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
    }
  }

  validate(c: FormControl): { [key: string]: any } | null {
    const val = c.value;
    if (!val) {
      return null;
    }
    if (val.province && val.city && val.district && val.street && val.street.length >= 4) {
      return null;
    }
    return {
      addressNotValid: true
    };
  }

  // 设置初始值
  public writeValue(obj: Address) {
    if (obj) {
      this._address = obj;
      if (this._address.province) {
        this._province.next(this._address.province);
      }
      if (this._address.city) {
        this._city.next(this._address.city);
      }
      if (this._address.district) {
        this._district.next(this._address.district);
      }
      if (this._address.street) {
        this._street.next(this._address.street);
      }
    }
  }

  // 当表单控件值改变时，函数 fn 会被调用
  // 这也是我们把变化 emit 回表单的机制
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  // 这里没有使用，用于注册 touched 状态
  public registerOnTouched() {
  }

  onProvinceChange() {
    this._province.next(this._address.province);
  }

  onCityChange() {
    this._city.next(this._address.city);
  }

  onDistrictChange() {
    this._district.next(this._address.district);
  }

  onStreetChange() {
    this._street.next(this._address.street);
  }
}
