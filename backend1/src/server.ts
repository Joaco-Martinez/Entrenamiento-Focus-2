import { app } from "./app";

const port = Number(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API running on port ${port}`);
  console.log(`📚 Swagger: /docs`);
});