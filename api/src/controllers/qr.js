//https://dev.to/dmshvetsov/append-an-image-to-a-pdf-file-with-node-js-script-5bfj


const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { PDFDocument } = require("pdf-lib");

const pathToPDF = 'src/controllers/invoice.pdf';
const pathToImage = 'src/controllers/qr.png';

//const run = async ({ pathToPDF, pathToImage }) => {
const run = async () => {
    const pdfDoc = await PDFDocument.load(fs.readFileSync(pathToPDF));
    const img = await pdfDoc.embedPng(fs.readFileSync(pathToImage));
    //const imagePage = pdfDoc.insertPage(0);
    const imagePage = pdfDoc.getPage(0);
    let xx = imagePage.getWidth();
    let yy = imagePage.getHeight();
    console.log(imagePage.getX())
    console.log(imagePage.getY());
    imagePage.drawImage(img, {
        x: xx - 100,
        y: yy - (yy - 50),
        width: 70,
        height: 70,
    });

  const pdfBytes = await pdfDoc.save();
  const newFilePath = `${path.basename(pathToPDF, ".pdf")}-result.pdf`;
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
run().catch(console.error);
