// Component: el decorador que convierte esta clase en un componente de Angular.
// signal / computed: herramientas reactivas. Cuando un "signal" cambia,
// Angular vuelve a pintar automáticamente las partes de la vista que lo usan.
import { Component, computed, inject, signal } from '@angular/core';

// FormsModule habilita [(ngModel)] y los eventos ngModelChange en el HTML.
import { FormsModule } from '@angular/forms';

// DecimalPipe es el pipe que usamos como "| number" para dar formato a los números.
import { DecimalPipe } from '@angular/common';

// Importamos el servicio y el tipo de moneda que creamos aparte.
import { CurrencyService, type CurrencyCode } from '../services/currency.service';

// Una pequeña interface para describir cada moneda que mostramos en el select.
interface Currency {
  code: CurrencyCode; // Ej: "USD"
  name: string; // Ej: "Dólar estadounidense"
  flag: string; // La banderita como emoji, Ej: "🇺🇸"
}

@Component({
  selector: 'app-currency-converter', // La etiqueta HTML: <app-currency-converter>
  imports: [FormsModule, DecimalPipe], // Lo que este componente necesita en su HTML
  templateUrl: './currency-converter.html', // Su vista (HTML)
  styleUrl: './currency-converter.css', // Sus estilos (CSS)
})
export class CurrencyConverter {
  // inject() pide una instancia del servicio (la misma para toda la app).
  private currencyService = inject(CurrencyService);

  // Lista fija de las 4 monedas. No cambia nunca, por eso es una propiedad normal.
  // El pipe "number" y el "*ngFor/@for" la recorren en el HTML.
  readonly currencies: Currency[] = [
    { code: 'USD', name: 'Dólar estadounidense', flag: '🇺🇸' },
    { code: 'ARS', name: 'Peso argentino', flag: '🇦🇷' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'BRL', name: 'Real brasileño', flag: '🇧🇷' },
  ];

  // ---------------------------------------------------------------------------
  // ESTADO DEL COMPONENTE (todo con signals)
  // Un signal es una caja con un valor dentro. Se lee con paréntesis: amount()
  // y se modifica con .set(): amount.set(10).
  // ---------------------------------------------------------------------------

  // Cantidad que escribe el usuario en el input.
  readonly amount = signal<number>(1);

  // Moneda de origen seleccionada en el primer select.
  readonly fromCurrency = signal<CurrencyCode>('USD');

  // Moneda de destino seleccionada en el segundo select.
  readonly toCurrency = signal<CurrencyCode>('BRL');

  // Rates que devuelve la API. Empieza vacío {} hasta que responde el servidor.
  readonly rates = signal<Record<string, number>>({});

  // true mientras esperamos la respuesta de la API (para mostrar "Cargando...").
  readonly loading = signal<boolean>(true);

  // Si algo falla guardamos un mensaje de error aquí.
  readonly error = signal<string | null>(null);

  // ---------------------------------------------------------------------------
  // VALORES CALCULADOS (computed)
  // computed() recalcula solo cuando alguno de los signals que usa cambia.
  // ---------------------------------------------------------------------------

  // Cuántas unidades de la moneda destino equivalen a 1 unidad de la origen.
  readonly exchangeRate = computed(() => {
    const rates = this.rates();
    const from = this.fromCurrency();
    const to = this.toCurrency();

    // Si todavía no llegaron los rates, devolvemos 0 para evitar errores.
    if (!rates[from] || !rates[to]) {
      return 0;
    }

    // La API da todos los valores contra USD.
    // Para pasar de "from" a "to": primero a USD y luego a "to".
    return rates[to] / rates[from];
  });

  // Resultado final de la conversión = cantidad × tasa de cambio.
  readonly convertedAmount = computed(() => this.amount() * this.exchangeRate());

  // Texto con la bandera de la moneda origen (para mostrarlo en el resultado).
  readonly fromFlag = computed(
    () => this.currencies.find((c) => c.code === this.fromCurrency())?.flag ?? '',
  );

  // Texto con la bandera de la moneda destino.
  readonly toFlag = computed(
    () => this.currencies.find((c) => c.code === this.toCurrency())?.flag ?? '',
  );

  // El constructor se ejecuta una sola vez al crear el componente.
  // Aquí pedimos los rates al servicio.
  constructor() {
    // .subscribe() "enciende" el Observable: recién ahí se hace la petición HTTP.
    this.currencyService.getRates().subscribe({
      // next: se ejecuta cuando la respuesta llega bien.
      next: (rates) => {
        this.rates.set(rates); // Guardamos los rates en el signal.
        this.loading.set(false); // Ya no estamos cargando.
      },
      // error: se ejecuta si falla la red o la API.
      error: () => {
        this.error.set('No se pudieron cargar los tipos de cambio. Intentá de nuevo.');
        this.loading.set(false);
      },
    });
  }

  // Intercambia las monedas de origen y destino (botón con las flechas).
  swapCurrencies(): void {
    // Guardamos temporalmente el valor actual de "from".
    const previousFrom = this.fromCurrency();
    // "to" pasa a ser "from" y el valor guardado pasa a ser "to".
    this.fromCurrency.set(this.toCurrency());
    this.toCurrency.set(previousFrom);
  }
}
