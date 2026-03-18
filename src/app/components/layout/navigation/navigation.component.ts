import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { UserService } from './../../../services/user.service';
import { DimensionService } from './../../../services/dimension.service';

import { Role } from './../../../models/user.model';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    imports: [
        RouterLink,
        RouterLinkActive,
    ]
})

export class NavigationComponent {

    constructor(
        private router: Router,
        public userService: UserService,
        public dimensionService: DimensionService) { }

    public Role = Role;

    public logout(): void {
        this.userService.logout();
        this.router.navigate(['/login']);
    }

}
