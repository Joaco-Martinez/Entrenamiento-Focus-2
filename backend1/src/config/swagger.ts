import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Back Focus API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3005" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    }
  },
  apis: ["./src/**/*.ts"],
  // apis: ["src/routes/*.routes.ts", "src/payments/MPCheckout/mpCheckout.routes.ts", "src/payments/MPSuscriptions/routes.ts", "src/payments/PaypalCheckout/paypal.routes.ts", "src/payments/paypalSubscriptions.routes.ts"] // archivos con anotaciones OpenAPI
});