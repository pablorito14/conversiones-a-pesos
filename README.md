# ConversionApp

Webapp familiar para conversion de Francos Suizos y Euros a Pesos Argentinos.


### corregir cache crash safari en node_modules/@angular/service_worker/ngsw_worker.js

Cambiar:
```js
const cachedResponse = await cache.match(req, this.config.cacheQueryOptions);
```
Por:
```js
let cachedResponse = Response | undefined;
try {
  cachedResponse = await cache.match(req, this.config.cacheQueryOptions);
} catch (error) {
  throw new SwCriticalError(`Cache is throwing while looking for a match: ${error}`);
}
```