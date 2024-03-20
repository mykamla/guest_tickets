const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Définir le dossier de destination pour sauvegarder les fichiers téléchargés
const destination = path.join(__dirname, "telechargements");

// Configurer Multer pour gérer le téléchargement de fichiers multiples
const upload = multer({ dest: destination });

// Endpoint pour télécharger plusieurs fichiers
app.post("/telecharger", upload.array("fichiers"), (req, res) => {
  try {
    // Vérifier si des fichiers ont été téléchargés
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Aucun fichier téléchargé.");
    }

    // Boucle à travers les fichiers téléchargés et déplacez-les vers le dossier de destination
    req.files.forEach((file) => {
      const fichierDestination = path.join(destination, file.originalname);
      // Déplacer le fichier vers le dossier de destination
      fs.rename(file.path, fichierDestination, (err) => {
        if (err) throw err;
        console.log(
          `Le fichier ${file.originalname} a été téléchargé avec succès.`
        );
      });
    });

    res.status(200).send("Téléchargement des fichiers réussi.");
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors du téléchargement des fichiers : " + error.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
