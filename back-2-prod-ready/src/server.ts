import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`✅ API running on http://localhost:${env.PORT}`);
  console.log(`📚 Swagger: http://localhost:${env.PORT}/docs`);
});