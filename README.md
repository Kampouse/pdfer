## Project Overview
This tool provides a PDF optimization utility that works by converting PDF pages to images and then rebuilding a new PDF from those images. This process can help reduce file size and remove unwanted elements from PDFs. The workflow involves:

1. Reading the input PDF and counting its pages
2. Converting each page to a JPEG image with optimized quality settings
3. Creating a new PDF document from these images
4. Cleaning up temporary image files

## InstallationThis
tool requires the following dependencies:

1. **GraphicMagick**: Used for image processing and conversion operations. The pdf2pic library relies on GraphicMagick to handle the PDF-to-image conversion process efficiently.

2. **Ghostscript**: Required for interpreting PostScript and PDF files during the conversion process. Works alongside GraphicMagick to properly render PDF content.

3. **Node.js dependencies**: Install using:
```bash
npm install
```

To install the system dependencies on various platforms:

- **Ubuntu/Debian**: `sudo apt-get install graphicsmagick ghostscript`
- **macOS**: `brew install graphicsmagick ghostscript`
- **Windows**: Download and install from their respective websites

Docker : docker build -t pdfer . && docker run -p 3000:3000 pdfer
curl -X POST -F 'file=@6761691-EASA-6.pdf' http://localhost:3000/optimize --output optimized.pdf c
