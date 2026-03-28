import app from "./app.js";
import env from "./config/env.js";

app.listen(env.port, () => {
  console.log(`OMW backend running on http://localhost:${env.port}`);
});

// Trigger nodemon restart - customer rewards page backend updated
