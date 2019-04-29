import { Component } from '@angular/core';
import { CheckForUpdateService } from './shared/services/check-for-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'map-trader';
  constructor(updater: CheckForUpdateService) {}
}
