import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
    imports: [RouterLink],
})

export class FooterComponent {
    public currentYear = new Date().getFullYear();
}
