import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  exports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ]
})
export class MaterialModule { }
