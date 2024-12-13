import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-recomendaciones',
  imports: [],
  templateUrl: './recomendaciones.component.html',
  styleUrl: './recomendaciones.component.css'
})
export class RecomendacionesComponent {
  popularSearches: string[] = [
    "closet", "comedor", "sofa cama", "cama", "sofa",
    "tocador", "mesa de centro", "camarote",
    "centro de entretenimiento", "sala"
  ];

  @Output() recomendacion = new EventEmitter<string>()

  onPassRecomendacion = (recomendo: string) => {
    this.recomendacion.emit(recomendo)
  }
}
