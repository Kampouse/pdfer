import { PDFDocument } from "pdf-lib";
import fs from "fs";
import { fromPath, fromBuffer } from "pdf2pic";

// Step 1: Reading and Counting Pages in the PDF
async function getPdfPageCount(pdfBuffer: Buffer) {
  console.log(`📖 Reading PDF from buffer...`);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();
  console.log(`📄 Found ${pageCount} pages in the PDF`);
  return pageCount;
}

// Step 2: Converting PDF Pages to Images
async function convertPdfToImages(pdfBuffer: Buffer) {
  console.log(`🔄 Starting PDF to image conversion...`);

  const pdf2picConverter = fromBuffer(pdfBuffer, {
    density: 150, // Reduced DPI for better compression
    format: "jpeg", // Changed to JPEG for better compression
    width: 800,
    height: 1000,
    quality: 80, // Added quality setting for JPEG compression
  });

  const pageCount = await getPdfPageCount(pdfBuffer);
  const imageBuffers: Buffer[] = [];

  for (let i = 1; i <= pageCount; i++) {
    console.log(`⏳ Starting conversion of page ${i}...`);
    const result = await pdf2picConverter(i, { responseType: "buffer" });
    console.log(`✅ Converted page ${i} to image.`);
    if (result.buffer) {
      imageBuffers.push(result.buffer);
    }
  }

  console.log(`🎉 All pages converted to images in memory!`);
  return imageBuffers;
}

// Step 3: Creating PDF from Images
async function createPdfFromImages(imageBuffers: Buffer[]) {
  console.log(`📝 Creating new PDF from ${imageBuffers.length} images...`);
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < imageBuffers.length; i++) {
    const imageBuffer = imageBuffers[i];
    console.log(
      `📄 Processing image ${i + 1}/${imageBuffers.length} in memory`,
    );

    // Embed the image in the PDF
    const image = await pdfDoc.embedJpg(imageBuffer);

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    console.log(`✅ Added page ${i + 1} to PDF`);
  }

  console.log(`💾 Generating PDF bytes...`);
  const pdfBytes = await pdfDoc.save();

  console.log("🎉 PDF created from images in memory");
  return pdfBytes;
}

// Main function that can be called from other files
export async function optimizePdf(
  input: string | Buffer,
  outputPdfPath?: string,
  returnBuffer: boolean = false,
): Promise<string | Buffer> {
  try {
    console.log(`🚀 Starting PDF processing...`);

    // Handle input based on type
    let pdfBuffer: Buffer;
    if (typeof input === "string") {
      console.log(`📂 Input file: ${input}`);
      pdfBuffer = fs.readFileSync(input);
    } else {
      console.log(`📄 Input provided as buffer`);
      pdfBuffer = input;
    }

    if (outputPdfPath) {
      console.log(`📂 Output file: ${outputPdfPath}`);
    }

    // Convert PDF pages to images in memory
    const imageBuffers = await convertPdfToImages(pdfBuffer);

    // Create new PDF from images in memory
    if (imageBuffers.length > 0) {
      const outputPdfBuffer = await createPdfFromImages(imageBuffers);

      // Return buffer or write to file based on the returnBuffer flag
      // Write the final output to file
      //fs.writeFileSync(finalOutputPath, outputPdfBuffer);

      console.log(`✨ Process completed successfully!`);
      return outputPdfBuffer;
    } else {
      throw new Error("No images were generated from PDF");
    }
  } catch (error) {
    console.error(`❌ Error occurred:`, error);
    throw error;
  }
}

// Run the script if called directly from command line
if (require.main === module) {
  (async () => {
    try {
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
      const outputPdfPath =
        args.length > 1 ? args[1] : "output-from-images.pdf";

      await optimizePdf(pdfPath, outputPdfPath);
    } catch (error) {
      console.error(`❌ Error occurred:`, error);
      process.exit(1);
    }
  })();
}
