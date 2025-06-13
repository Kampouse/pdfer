import Bun from "bun";
import { optimizePdf } from ".";

Bun.serve({
  port: 3000,
  async fetch(req) {
    // Only handle POST requests to /optimize
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(req.url);
    if (url.pathname !== "/optimize") {
      return new Response("Not found", { status: 404 });
    }

    try {
      // Parse the multipart form data
      const formData = await req.formData();
      const file = formData.get("file");

      // Validate file
      if (!file || !(file instanceof File)) {
        return new Response("No file uploaded", { status: 400 });
      }

      // Check file type
      if (file.type !== "application/pdf") {
        return new Response("Only PDF files are supported", { status: 400 });
      }

      // Convert file to buffer
      const buffer = await file.arrayBuffer();

      // Process the PDF buffer directly
      const optimizedBuffer = await optimizePdf(Buffer.from(buffer));

      // Return the processed file
      return new Response(optimizedBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="optimized-${file.name}"`,
        },
      });
    } catch (error) {
      console.error("Error processing file:", error);
      return new Response("Error processing file", { status: 500 });
    }
  },
});

console.log("Server running on port 3000");
