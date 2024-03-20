import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";

const genererQRCode = async () => {
  const code = Math.random().toString(36).slice(-6);

  try {
    // Générer le QR code de base
    const urlCode = code;
    const url = await QRCode.toDataURL(urlCode);

    // Charger une image ou un logo à insérer dans le QR code (facultatif)
    //const image = await loadImage("chemin_vers_votre_image/logo.png"); // Remplacez par votre propre chemin

    // Créer un canvas pour personnaliser le QR code
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext("2d");

    // Dessiner le QR code de base sur le canvas
    ctx.drawImage(await loadImage(url), 0, 0, canvas.width, canvas.height);

    // Dessiner l'image ou le logo sur le QR code (facultatif)
    //ctx.drawImage(image, 100, 100, 100, 100); // Adapter la position et la taille selon vos besoins

    // Sauvegarder le QR code stylisé en format PNG
    const qrCodeStylise = canvas.createPNGStream();
    const qrFile = qrCodeStylise.pipe(
      fs.createWriteStream(`datas_qr/${code}.png`)
    ); // Enregistrer le fichier

    return qrFile.path; // Retourner le nom du fichier généré
  } catch (error) {
    console.error("Erreur lors de la génération du QR code :", error);
    return null;
  }
};

export default genererQRCode;
//module.exports = { genererQRCode };
