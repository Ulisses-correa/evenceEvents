import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../componentes/header/header';

@Component({
  selector: 'app-extra-infos',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './extra-infos.component.html',
  styleUrl: './extra-infos.component.css'
})
export class ExtraInfosComponent {
}
