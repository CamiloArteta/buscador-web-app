import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://3.90.7.8:3000/productos'

  constructor(private http: HttpClient) {}

  getData = (searchTerm: any, color: any, categoria: any, startPrecio: any, endPrecio: any, order: any, tienda: any): Observable <any> => {
    let URL = `${this.apiUrl}/search?query=${searchTerm}`

    if (color) {
      URL = URL + `&color=${color}`
    }

    if (categoria) {
      URL = URL + `&categoria=${categoria}`
    }

    if (startPrecio) {
      URL = URL + `&startPrecio=${startPrecio}`
    }

    if (endPrecio) {
      URL = URL + `&endPrecio=${endPrecio}`
    }

    if(order) {
      URL = URL + `&order=${order}`
    }
    console.log(URL)

    return this.http.get(URL)
  }
}
