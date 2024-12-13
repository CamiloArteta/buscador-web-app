import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { RecomendacionesComponent } from '../recomendaciones/recomendaciones.component';
import { InfiniteScrollCustomEvent, IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { debounceTime, fromEvent, map } from 'rxjs';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'
import { search, close } from 'ionicons/icons'
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-buscador',
  imports: [ReactiveFormsModule, RecomendacionesComponent, IonIcon, IonInfiniteScroll, IonContent, IonInfiniteScrollContent],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent {
  searchForm = new FormGroup({
    searchTerm: new FormControl(''),
    startPrecio: new FormControl(''),
    endPrecio: new FormControl(''),
    order: new FormControl('')
  })

  consulta: any = ''
  colores: any[] = []
  categorias: any[] = []
  startPrecio: any = ''
  endPrecio: any = ''
  order: any = ''
  tienda: string = ''
  mostrarMasColor: boolean = false
  mostrarMasCateg: boolean = false
  coloresResult: any[] = []
  commonColors: string[] = ['amarillo', 'azul', 'beige', 'taupe', 'natural']
  otrosColores: any[] = []
  selectedColores: any[] = []
  selectedCateg: any[] = []
  categoriasResult: any[] = []
  displayedResults: any[] = []
  pageSize: number = 20

  results: any[] = []

  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll | undefined;

  private apiService = inject(ApiService)
  constructor (public sanitizer: DomSanitizer) {
    addIcons({ search, close })
  }

  ngOnInit(): void {
    const searchTerm: any = document.getElementById('search')
    const keyup = fromEvent(searchTerm, 'keyup')


    keyup.pipe(
      map((e: any) => e.currentTarget.value),
      debounceTime(500)
    ).subscribe(() => {
      this.onSearch()
    })
  }

  onSearch = (): void => {
    this.consulta = this.searchForm.value.searchTerm?.trim()
    this.coloresResult = []
    this.categoriasResult = []
    this.otrosColores = []
    this.results = []
    this.displayedResults = [];

    if (this.infiniteScroll) {
      this.infiniteScroll.complete();
      this.infiniteScroll.disabled = false;
    }

    if (this.searchForm.value.searchTerm?.trim() === '') {
      this.results = []
      this.displayedResults = [];
      return
    }

    this.apiService.getData(this.consulta, this.getColores(), this.getCategorias(), this.startPrecio, this.endPrecio, this.order, this.tienda).subscribe(
      (data) => {
        this.results = data

        this.results.map((result) => {
          result.color.map((colorIn: any) => {
            if (!this.coloresResult.includes(colorIn)) {
              if (colorIn !== 'NA') {
                this.coloresResult.push(colorIn)
              }
            }
          })

          if (!this.categoriasResult.includes(result.categoria)) {
            this.categoriasResult.push(result.categoria)
          }
        })

        this.getOtrosColores(this.coloresResult)
        this.loadMoreResults();
      },
      (error) => {
        console.error(`Ha ocurrido un error en la búsqueda: ${error.message}`)
      }
    )
  }

  loadMoreResults = (): void => {
    const newResults = this.results.slice(this.displayedResults.length, this.displayedResults.length + this.pageSize);
    this.displayedResults = [...this.displayedResults, ...newResults];
    console.log('loading')
  };

  onIonInfinite(event: any) {
    setTimeout(() => {
      this.loadMoreResults();
      (event as any).target.complete();
      console.log('entro')

      if (this.displayedResults.length >= this.results.length) {
        (event as any).target.disabled = true;
      }
    }, 500);
  }

  getColores = (): string => {
    const resultadoColores: any[] = []

    this.colores.map((color) => {
      if (color.enBuscar) {
        resultadoColores.push(color.color)
      }
    })

    return resultadoColores.join(',')
  }

  getCategorias = (): string => {
    const resultadoCategorias: any[] = []

    this.categorias.map((categoria) => {
      if (categoria.enBuscar) {
        resultadoCategorias.push(categoria.categoria)
      }
    })

    return resultadoCategorias.join(',')
  }

  onCheckChange = (type: 'color' | 'categoria', event: Event) => {
    const checkbox = event.target as HTMLInputElement

    if (checkbox.checked) {
      if (type === 'color') {
        if (checkbox.value === 'otro') {
          this.colores = this.colores.filter(color => !this.otrosColores.includes(color.color))
          this.selectedColores.push(checkbox.value)
          this.otrosColores.map((color) => {
            this.colores.push({ color: color, enBuscar: true })
          })
        } else {
          this.selectedColores.push(checkbox.value)
          this.colores.push({ color: checkbox.value, enBuscar: true })
        }
      } else if (type === 'categoria') {
        this.selectedCateg.push(checkbox.value)
        this.categorias.push({ categoria: checkbox.value, enBuscar: true })
      }
    } else {
      if (type === 'color') {
        if (checkbox.value === 'otro') {
          this.colores = this.colores.filter(color => !this.otrosColores.includes(color.color))
          this.selectedColores = this.selectedColores.filter((color) => color !== checkbox.value)
        } else {
          this.colores = this.colores.filter((color) => color.color !== checkbox.value)
          this.selectedColores = this.selectedColores.filter((color) => color !== checkbox.value)
        }
      } else if (type === 'categoria') {
        this.selectedCateg = this.selectedCateg.filter((categoria) => categoria !== checkbox.value)
        this.categorias = this.categorias.filter((categoria) => categoria.categoria !== checkbox.value)
      }
    }

    this.onSearch()
  }

  onClickPrecios = (event: Event) => {
    this.startPrecio = this.searchForm.value.startPrecio !== '' ? this.searchForm.value.startPrecio : 0
    this.endPrecio = this.searchForm.value.endPrecio !== '' ? this.searchForm.value.endPrecio : 99999999

    this.onSearch()
  }

  onOrder = () => {
    this.order = this.searchForm.value.order
    console.log(this.order)

    this.onSearch()
  }

  updateSearchFromRec = (recomendacion: string) => {
    this.searchForm.value.searchTerm = recomendacion
    
    this.onSearch()
  }

  toggleMostrarMasColor = () => {
    this.mostrarMasColor = !this.mostrarMasColor
  }

  toggleMostrarMasCateg = () => {
    this.mostrarMasCateg = !this.mostrarMasCateg
  }

  deleteFiltros = () => {
    this.colores = []
    this.categorias = []

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    checkboxes.forEach((checkbox: any) => (checkbox.checked = false))

    this.startPrecio = ''
    this.endPrecio = ''
    this.searchForm.patchValue({ startPrecio: this.startPrecio, endPrecio: this.endPrecio })

    this.order = ''
    this.searchForm.patchValue({ order: this.order })
    this.displayedResults = [];
  }

  activeFiltro = (): boolean => {
    if (this.colores.length !== 0 || this.categorias.length !== 0) {
      return false
    } else if (this.startPrecio.length !== 0 || this.endPrecio.length !== 0) {
      return false
    } else if (this.order.length !== 0) {
      return false
    } else {
      return true
    }
  }

  onSearchChange = () => {
    this.deleteFiltros()
  }

  getOtrosColores = (colores: any[]) => {
    colores.map((color) => {
      if (!this.commonColors.includes(color)) {
        this.otrosColores.push(color)
      }
    })
  }

  deleteSearch = () => {
    this.deleteFiltros()
    this.results = []
    this.consulta = ''
    this.searchForm.value.searchTerm = ''
    this.displayedResults = [];
  }
}
