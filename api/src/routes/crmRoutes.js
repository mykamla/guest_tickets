import pasteQr from "../controllers/makePdf.js";
import genererQRCode from "../controllers/makeQr.js";
import { setTimeout } from "timers/promises";
import { fileURLToPath } from "url";

import multer from "multer";
import path from "path";
import fs from "fs";

//const multer = require("multer");
//const path = require("path");
//const fs = require("fs");

const routes = (app) => {
  function parcourirRepertoire() {
    try {
      // Liste pour stocker les chemins complets des fichiers
      let listeFichiers = [];

      // Lecture du contenu du répertoire
      const fichiers = fs.readdirSync("datas_result/");

      // Parcours de chaque fichier du répertoire
      fichiers.forEach((fichier) => {
        // Obtenir le chemin complet du fichier
        const cheminFichier = path.join("datas_result/", fichier);

        // Vérifier si c'est un fichier (exclut les sous-répertoires)
        if (fs.statSync(cheminFichier).isFile()) {
          // Ajouter le chemin complet et le nom du fichier à la liste
          listeFichiers.push({ path: cheminFichier, name: fichier });
        }
      });

      return listeFichiers;
    } catch (erreur) {
      console.error("Erreur lors de la lecture du répertoire :", erreur);
      return [];
    }
  }

  function verifierFichierParMotCle(code) {
    try {
      // Lecture du contenu du répertoire
      const fichiers = fs.readdirSync("datas_result");

      let filename = "";
      // Vérification de chaque fichier pour voir s'il contient le mot clé dans son nom
      const fichierTrouve = fichiers.find((fichier) => {
        // Obtention du dernier mot après le '#'
        const dernierMot = fichier.split("#").pop().trim();
        filename = fichier;

        // Vérification si le mot clé est présent dans le nom du fichier
        return dernierMot === `${code}.pdf`;
      });

      if (fichierTrouve) {
        return [filename, true];
      } else {
        return ["", false];
      }
    } catch (erreur) {
      console.error("Erreur lors de la recherche du fichier :", erreur);
      return null;
    }
  }

  app.route("/verify").post((req, res) => {
    console.log("verify");
    console.log(req.body);
    if (!req.body || req.body.length === 0) {
      return res.status(400).send(false);
    } else {
      let code = req.body["code"];
      let v =
        verifierFichierParMotCle(code) == null
          ? []
          : verifierFichierParMotCle(code);
      if (v[1] == true) {
        let name = "";
        let table = "";
        try {
          name = extractDataFileName(verifierFichierParMotCle(code)[0])[0];
        } catch (err) {
          console.error(err);
        }

        try {
          table = extractDataFileName(verifierFichierParMotCle(code)[0])[1];
        } catch (err) {
          console.error(err);
        }

        res.send({
          message: `Vienvenue ${name}, nous sommes heureux de vous compter parmi nos convives, vous serez installé à la ${table}`,
          name: name,
          table: table,
          exist: true,
        });
      } else {
        res.send({ message: "", exist: false });
      }
    }
  });

  app.route("/zip").get((req, res) => {
    res.zip(parcourirRepertoire());
  });

  // Définir le dossier de destination pour sauvegarder les fichiers téléchargés
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const destination = path.join(__dirname, "../../datas");
  // Configurer Multer pour gérer le téléchargement de fichiers multiples
  const upload = multer({ dest: destination });

  // Endpoint pour télécharger plusieurs fichiers
  app.post("/download", upload.array("files"), async (req, res) => {
    try {
      // Vérifier si des fichiers ont été téléchargés
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("Aucun fichier téléchargé.");
      }

      // Boucle à travers les fichiers téléchargés et déplacez-les vers le dossier de destination
      await reqForEach(req, destination);
      res.status(200).send("Téléchargement des fichiers réussi.");
    } catch (error) {
      res
        .status(500)
        .send("Erreur lors du téléchargement des fichiers : " + error.message);
    }
  });
};

async function reqForEach(req, destination) {
  req.files.forEach(async (file) => {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    const fichierDestination = path.join(destination, file.originalname);

    const ex = path.extname(fichierDestination);
    //const fi = path.basename(fichierDestination, ex);
    console.log(ex);
    if (ex == ".pdf") {
      // Déplacer le fichier vers le dossier de destination
      await remane(file, fichierDestination);

      let qf = null;

      const maPromesse = new Promise(async (resolve, reject) => {
        const qrFile = await genererQRCode(
          extractDataFileName(file.originalname)
        );
        resolve(qrFile);
      });

      maPromesse.then(async (qrFile) => {
        await setTimeout(10000);
        try {
          await pasteQr(qrFile, fichierDestination);
        } catch (err) {
          console.error(err);
        }
      });
    }
  });
}

const remane = async function (file, fichierDestination) {
  return fs.rename(file.path, fichierDestination, (err) => {
    if (err) throw err;
    console.log(
      `Le fichier ${file.originalname} a été téléchargé avec succès.`
    );
  });
};

function extractDataFileName(fileName) {
  //const regex = /(?:^|[^#])#([^#.]+)/g;
  const regex = /[^#]+/g;

  const resultats = [];
  let match;

  while ((match = regex.exec(fileName)) !== null) {
    resultats.push(match[0]); // Les données extraites sont stockées dans match[1]
  }
  console.log(resultats);
  return resultats;
}

export default routes;
