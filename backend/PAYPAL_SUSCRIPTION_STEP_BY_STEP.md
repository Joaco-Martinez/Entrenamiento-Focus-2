# PayPal Suscription - paso a paso simple

## 1) Qué hace este módulo
Este módulo crea y confirma suscripciones de PayPal usando estos endpoints:

- `POST /paypal_suscription/create`
- `POST /paypal_suscription/confirm`
- `GET /paypal_suscription/:subscriptionId`
- `POST /paypal_suscription/webhook`

> Sí, queda escrito como **suscription** porque vos lo pediste así en la ruta y en las variables.

---

## 2) Qué necesita cada producto
En tu tabla/modelo `Product`, el producto que quieras vender como suscripción debe tener:

- `isSubscription = true`
- `paypalPlanId = "ID_DEL_PLAN_EN_PAYPAL"`

Sin eso, el backend va a rechazar la creación.

---

## 3) Variables de entorno
Poné estas variables en tu `.env`:

```env
PAYPAL_SUSCRIPTION_CLIENT_ID=TU_CLIENT_ID
PAYPAL_SUSCRIPTION_CLIENT_SECRET=TU_CLIENT_SECRET
PAYPAL_SUSCRIPTION_WEBHOOK_ID=TU_WEBHOOK_ID
PAYPAL_SUSCRIPTION_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_SUSCRIPTION_RETURN_URL=http://localhost:3000/subscription/paypal/return
PAYPAL_SUSCRIPTION_CANCEL_URL=http://localhost:3000/subscription/paypal/cancel
PAYPAL_SUSCRIPTION_WEBHOOK_URL=https://tu-back.com/paypal_suscription/webhook
```

### Sandbox
Para probar, dejá:

```env
PAYPAL_SUSCRIPTION_BASE_URL=https://api-m.sandbox.paypal.com
```

### Producción
Cuando pases a live, usá:

```env
PAYPAL_SUSCRIPTION_BASE_URL=https://api-m.paypal.com
```

---

## 4) Crear el plan en PayPal
Antes de usar el endpoint, en PayPal tenés que tener creado el producto/plan de suscripción.
Después copiás el `plan_id` y lo guardás en `paypalPlanId` del producto.

Ejemplo:

- producto interno: `Focus Premium Mensual`
- `paypalPlanId`: `P-5ML4271244454362WXNWU5NQ`

---

## 5) Crear la suscripción desde tu frontend
Hacé request a:

```http
POST /paypal_suscription/create
Authorization: Bearer TU_TOKEN
Content-Type: application/json
```

Body mínimo:

```json
{
  "productId": "ID_DEL_PRODUCTO"
}
```

Body opcional si querés sobrescribir URLs:

```json
{
  "productId": "ID_DEL_PRODUCTO",
  "returnUrl": "http://localhost:3000/subscription/paypal/return",
  "cancelUrl": "http://localhost:3000/subscription/paypal/cancel"
}
```

### Respuesta esperada

```json
{
  "ok": true,
  "id": "I-ABCDEFG12345",
  "approveUrl": "https://www.sandbox.paypal.com/webapps/billing/subscriptions?...",
  "returnUrl": "http://localhost:3000/subscription/paypal/return",
  "cancelUrl": "http://localhost:3000/subscription/paypal/cancel"
}
```

Con esa respuesta, redirigís al usuario a `approveUrl`.

---

## 6) Qué pasa cuando el usuario aprueba
PayPal te manda al `returnUrl`.
Normalmente PayPal manda un parámetro en la URL llamado `subscription_id`.

Ejemplo:

```ts
const subscriptionId = searchParams.get("subscription_id");
```

Cuando lo tengas, llamás a:

```http
POST /paypal_suscription/confirm
Authorization: Bearer TU_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "subscriptionId": "I-ABCDEFG12345"
}
```

Ese endpoint:

- consulta PayPal
- valida que la suscripción corresponda al usuario
- guarda/actualiza la tabla `Subscription`
- deja el estado sincronizado

---

## 7) Ver detalle de la suscripción
Podés consultar:

```http
GET /paypal_suscription/I-ABCDEFG12345
Authorization: Bearer TU_TOKEN
```

Eso te devuelve el detalle directo desde PayPal.

---

## 8) Webhook de PayPal
En el panel de PayPal configurá el webhook apuntando a:

```text
https://tu-back.com/paypal_suscription/webhook
```

Guardá el `webhook id` en:

```env
PAYPAL_SUSCRIPTION_WEBHOOK_ID=...
```

El webhook sirve para mantener actualizada tu DB cuando PayPal cambie el estado:

- activada
- suspendida
- cancelada
- expirada

---

## 9) Flujo completo resumido
1. Creás el plan en PayPal.
2. Guardás ese `plan_id` en `product.paypalPlanId`.
3. El usuario inicia sesión.
4. Tu front llama `POST /paypal_suscription/create`.
5. Recibís `approveUrl`.
6. Redirigís al usuario a PayPal.
7. PayPal devuelve al `returnUrl`.
8. Tu front lee `subscription_id`.
9. Tu front llama `POST /paypal_suscription/confirm`.
10. El backend sincroniza y guarda la suscripción.
11. El webhook ayuda a mantener todo actualizado después.

---

## 10) Errores comunes

### `Product is not a subscription`
Ese producto no tiene `isSubscription = true`.

### `Product missing paypalPlanId`
Te falta guardar el `plan_id` de PayPal en el producto.

### `Missing PayPal suscription credentials`
Te faltan:
- `PAYPAL_SUSCRIPTION_CLIENT_ID`
- `PAYPAL_SUSCRIPTION_CLIENT_SECRET`

### `Missing PAYPAL_SUSCRIPTION_RETURN_URL`
No mandaste `returnUrl` en el body y tampoco está en el `.env`.

### `Invalid PayPal webhook signature`
El `PAYPAL_SUSCRIPTION_WEBHOOK_ID` no coincide o PayPal no está enviando la firma correcta.

---

## 11) Ejemplo de frontend simple

```ts
const createRes = await fetch("http://localhost:3000/paypal_suscription/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ productId }),
});

const createData = await createRes.json();
window.location.href = createData.approveUrl;
```

Y en la página de retorno:

```ts
const subscriptionId = new URLSearchParams(window.location.search).get("subscription_id");

await fetch("http://localhost:3000/paypal_suscription/confirm", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ subscriptionId }),
});
```

---

## 12) Importante
Este módulo usa la tabla `Subscription` de tu proyecto y deja `provider: "PAYPAL"`.
No reemplaza tu checkout one-time de PayPal. Es solo para suscripciones.
