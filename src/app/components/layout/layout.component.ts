import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';

import { UserService } from './../../services/user.service';
import { DimensionService } from './../../services/dimension.service';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css',
    imports: [
        RouterOutlet,
        FooterComponent,
        NavigationComponent,
    ]
})

export class LayoutComponent {

    constructor(
        public dimensionService: DimensionService,
        private userService: UserService) {

      this.init();
    }

    public showLayout = signal(false);

    private async init(): Promise<void> {
      if (this.userService.isUserLogged()) {
        await this.userService.setUserFromDatabase();
      }

      this.showLayout.set(true);
    }

}
