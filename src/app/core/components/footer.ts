import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <mat-toolbar color="primary">
      <span class="fill-remaining-space"></span>
      <span>copy right</span>
      <span class="fill-remaining-space"></span>
    </mat-toolbar>
  `,
  styles: [`
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent { }
