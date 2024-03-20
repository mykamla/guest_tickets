//https://dev.to/dmshvetsov/append-an-image-to-a-pdf-file-with-node-js-script-5bfj
import path from "path";
import fs from "fs";
import assert from "assert";
import { PDFDocument } from "pdf-lib";
import { fileURLToPath } from 'url';

//const path = require("path");
//const fs = require("fs");
//const assert = require("assert");
//const { PDFDocument } = require("pdf-lib");

//const pathToPDF = 'src/controllers/invoice.pdf';
//const pathToImage = 'src/controllers/qr.png';
//const pathToImage = path.join(__dirname, "../../datas");
//const run = async ({ pathToPDF, pathToImage }) => {
const pasteQr = async (qrFile, fichierDestination) => {
  const fileEx = path.extname(fichierDestination);
  const fileName0 = path.basename(fichierDestination, fileEx);
  const ex = path.extname(qrFile);
  const fileName = fileName0 + "#" + path.basename(qrFile, ex);

  const pdfDoc = await PDFDocument.load(fs.readFileSync(fichierDestination));
  const img = await pdfDoc.embedPng(
    //  fs.readFileSync(`${pathToImage}/${code}.png`)
    fs.readFileSync(`${qrFile}`)
  );

  //const imagePage = pdfDoc.insertPage(0);
  const imagePage = pdfDoc.getPage(0);
  let xx = imagePage.getWidth();
  let yy = imagePage.getHeight();
  //console.log(imagePage.getX());
  //console.log(imagePage.getY());
  imagePage.drawImage(img, {
    x: xx - 200,
    y: yy - (yy - 50),
    width: 70,
    height: 70,
  });

  const pdfBytes = await pdfDoc.save();

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
  const destinationResultPath = path.join(__dirname, "../../datas_result");

console.log(destinationResultPath);

  try {
    if (!fs.existsSync(destinationResultPath)) {
      fs.mkdirSync(destinationResultPath);
    }
  } catch (err) {
    console.error(err);
  }

  const newFilePath = `${destinationResultPath}/${fileName}${fileEx}`;
  fs.writeFileSync(newFilePath, pdfBytes);
};

const ERRORS = {
  ARGUMENTS:
    "Please provide path to the PDF file as a first argument and path to image as the second argument",
};

//const pathToPDF = process.argv[2];
//console.log("pathToPDF@@@@@@@@@@@@@");
//console.log(process.argv[0]);
//assert.notEqual(pathToPDF, null, ERRORS.ARGUMENTS);
//const pathToImage = process.argv[3];
//assert.notEqual(pathToImage, null, ERRORS.ARGUMENTS);

//run({ pathToPDF, pathToImage }).catch(console.error);
//pasteQr().catch(console.error);

export default pasteQr;
//module.exports = { pasteQr };