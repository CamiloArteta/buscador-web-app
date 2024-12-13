import { Component } from '@angular/core';
import { BuscadorComponent } from './buscador/buscador.component';

@Component({
  selector: 'app-root',
  imports: [BuscadorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
