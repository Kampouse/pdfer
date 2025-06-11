import { PDFDocument } from "pdf-lib";
import fs from "fs";
import { fromPath } from "pdf2pic";

// Step 1: Reading and Counting Pages in the PDF
async function getPdfPageCount(pdfPath: string) {
  console.log(`📖 Reading PDF: ${pdfPath}`);
  const pdfData = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfData);
  const pageCount = pdfDoc.getPageCount();
  console.log(`📄 Found ${pageCount} pages in the PDF`);
  return pageCount;
}

// Step 2: Converting PDF Pages to Images
async function convertPdfToImages(pdfPath: string) {
  console.log(`🔄 Starting PDF to image conversion...`);

  const pdf2pic = fromPath(pdfPath, {
    density: 150, // Reduced DPI for better compression
    saveFilename: "page",
    savePath: ".",
    format: "jpeg", // Changed to JPEG for better compression
    width: 800,
    height: 1000,
    quality: 80, // Added quality setting for JPEG compression
  });

  const pageCount = await getPdfPageCount(pdfPath);

  const imagePaths: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    console.log(`⏳ Starting conversion of page ${i}...`);
    const outputFile = await pdf2pic(i);
    console.log(`✅ Converted page ${i} to image.`);
    if (outputFile.path) {
      imagePaths.push(outputFile.path);
    }
  }

  console.log(`🎉 All pages converted to images!`);
  return imagePaths;
}

// Step 3: Creating PDF from Images
async function createPdfFromImages(imagePaths: string[], outputPath: string) {
  console.log(`📝 Creating new PDF from ${imagePaths.length} images...`);
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    console.log(
      `📄 Processing image ${i + 1}/${imagePaths.length}: ${imagePath}`,
    );

    // Read the image file directly
    const imageBytes = fs.readFileSync(imagePath);

    // Embed the image in the PDF
    const image = await pdfDoc.embedJpg(imageBytes);

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    console.log(`✅ Added page ${i + 1} to PDF`);
  }

  console.log(`💾 Saving PDF to ${outputPath}...`);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  console.log("🎉 PDF created from images and saved to", outputPath);
}

// Step 4: Cleaning up temporary image files
async function cleanupImageFiles(imagePaths: string[]) {
  console.log(`🧹 Cleaning up temporary JPEG files...`);

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    try {
      fs.unlinkSync(imagePath);
      console.log(`🗑️ Removed temporary file: ${imagePath}`);
    } catch (error) {
      console.warn(`⚠️ Failed to remove file ${imagePath}:`, error);
    }
  }

  console.log(`✨ Cleanup completed. All temporary JPEG files removed.`);
}

// Main function to execute the steps
(async () => {
  try {
    console.log(`🚀 Starting PDF processing...`);

    // Get command line arguments
    const args = process.argv.slice(2);

    // Show usage information if no arguments provided
    if (args.length === 0) {
      console.log(`
📋 Usage:
  ts-node index.ts <input-pdf-path> [output-pdf-path]

📝 Example:
  ts-node index.ts document.pdf output.pdf

🔍 Parameters:
  - input-pdf-path: Path to the PDF file to process (required)
  - output-pdf-path: Path for the output PDF file (optional, defaults to "output-from-images.pdf")
      `);
      process.exit(1);
    }

    const pdfPath = args[0];
    const outputPdfPath = args.length > 1 ? args[1] : "output-from-images.pdf";

    console.log(`📂 Input file: ${pdfPath}`);
    console.log(`📂 Output file: ${outputPdfPath}`);

    // Convert PDF pages to images
    const imagePaths = await convertPdfToImages(pdfPath);

    // Create new PDF from images
    if (imagePaths.length > 0) {
      await createPdfFromImages(imagePaths, outputPdfPath);

      // Clean up temporary image files
      await cleanupImageFiles(imagePaths);
    }

    console.log(`✨ Process completed successfully!`);
  } catch (error) {
    console.error(`❌ Error occurred:`, error);
    process.exit(1);
  }
})();
