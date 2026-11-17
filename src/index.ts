// Entry point. Starts app.ts
//
//     npm run build
//     npm start

import { app } from "./app";

const portnr: number = 3000;

app.listen(portnr, () => {
  console.log(`Listening on http://localhost:${portnr}`);
});
