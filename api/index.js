import express from "express";
import bodyParser from "body-parser";
import routes from "./src/routes/crmRoutes.js";
import expressZip from "express-zip";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

app.use(cors());
//bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const destinationResultPath = path.join(__dirname, "/datas_qr");
try {
  if (!fs.existsSync(destinationResultPath)) {
    fs.mkdirSync(destinationResultPath);
  }
} catch (err) {
  console.error(err);
}

app.get("/", (req, res) =>
  res.send(`Serveur node et express sur port ${PORT}`)
);

//app.listen(PORT, () => console.log(`Votre serveur est sur le port ${PORT}`));
//app.listen();
//app.listen(PORT, "192.168.2.206");
app.listen(PORT, "127.0.0.1");
//server.on("listening", function () {
//  console.log(
//    "Express server started on port %s at %s",
//    server.address().port,
//    server.address().address
//  );
//});
