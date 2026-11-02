// Injectable: marca esta clase como un "servicio" que Angular puede inyectar
// (compartir) en cualquier componente que lo necesite.
import { Injectable, inject } from '@angular/core';

// HttpClient es la herramienta de Angular para hacer peticiones HTTP (fetch/AJAX).
import { HttpClient } from '@angular/common/http';

// Observable: representa una respuesta que llegará en el futuro (asíncrona).
// map: nos permite transformar esa respuesta antes de entregarla.
import { Observable, map } from 'rxjs';

// Los únicos 4 códigos de moneda que permite la aplicación.
// El tipo "CurrencyCode" es una unión de textos: solo admite estos valores.
export type CurrencyCode = 'USD' | 'ARS' | 'EUR' | 'BRL';

// Esta interface describe la "forma" que tiene la respuesta JSON de la API.
// Solo declaramos los campos que vamos a usar.
interface RatesResponse {
  result: string;
  base_code: string;
  // Record<string, number> significa: un objeto cuyas claves son texto
  // y sus valores son números. Ej: { USD: 1, ARS: 1537.34, EUR: 0.92 }
  rates: Record<string, number>;
}

// providedIn: 'root' hace que exista UNA sola instancia del servicio
// para toda la aplicación (patrón singleton).
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  // inject() obtiene automáticamente la dependencia HttpClient.
  // Es la forma moderna de pedir dependencias sin escribir un constructor.
  private http = inject(HttpClient);

  // URL gratuita de ExchangeRate-API. Devuelve los rates de todas las monedas
  // tomando como base 1 USD (es decir, rates["USD"] siempre vale 1).
  private readonly apiUrl = 'https://open.er-api.com/v6/latest/USD';

  // Método público que usará el componente.
  // Devuelve un Observable<Record<string, number>>: "cuando lleguen los datos,
  // te entrego un objeto con los rates".
  getRates(): Observable<Record<string, number>> {
    return this.http.get<RatesResponse>(this.apiUrl).pipe(
      // La API responde { result, base_code, rates, ... }.
      // Con map "sacamos" solo la parte de rates que es lo que nos interesa.
      map((response) => response.rates),
    );
  }
}
