import { Component } from '@angular/core';
import { CurrencyConverter } from './currency-converter/currency-converter';

// El componente raíz de la aplicación.
// Solo se encarga de mostrar el componente del conversor.
@Component({
  selector: 'app-root',
  imports: [CurrencyConverter],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
