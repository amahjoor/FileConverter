const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const { promisify } = require('util');
const libre = require('libreoffice-convert');
const net = require('net');

// Convert method from callback to promise
const convertAsync = promisify(libre.convert);

const app = express();
const initialPort = process.env.PORT || 3000;

// Check if a port is in use
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Find an available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    console.log(`Port ${port} is in use, trying ${port + 1}`);
    port++;
  }
  return port;
};

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    fsExtra.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename but add timestamp to avoid conflicts
    const originalName = file.originalname;
    const timestamp = Date.now();
    const fileName = `${timestamp}-${originalName}`;
    cb(null, fileName);
  }
});

// Set up multer for handling file uploads
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.ms-powerpoint' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PowerPoint files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // Increased to 50MB max file size
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Handle single file upload and conversion
app.post('/convert', upload.single('pptFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../output');
    fsExtra.ensureDirSync(outputDir);

    const inputPath = req.file.path;
    const outputFilename = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
    const outputPath = path.join(outputDir, outputFilename);

    // Read file
    const pptxBuf = await fs.promises.readFile(inputPath);

    // Convert to PDF
    const pdfBuf = await convertAsync(pptxBuf, '.pdf', undefined);
    
    // Save the PDF
    await fs.promises.writeFile(outputPath, pdfBuf);

    // Send download link
    res.json({
      message: 'File converted successfully',
      downloadLink: `/download/${outputFilename}`
    });
  } catch (error) {
    console.error('Error converting file:', error);
    res.status(500).json({ error: 'Failed to convert file' });
  }
});

// Handle multiple file uploads and conversion
app.post('/convert-multiple', upload.array('pptFiles', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../output');
    fsExtra.ensureDirSync(outputDir);

    const results = [];

    // Convert each file
    for (const file of req.files) {
      try {
        const inputPath = file.path;
        const outputFilename = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
        const outputPath = path.join(outputDir, outputFilename);

        // Read file
        const pptxBuf = await fs.promises.readFile(inputPath);

        // Convert to PDF
        const pdfBuf = await convertAsync(pptxBuf, '.pdf', undefined);
        
        // Save the PDF
        await fs.promises.writeFile(outputPath, pdfBuf);

        // Add to results
        results.push({
          originalName: file.originalname,
          convertedName: outputFilename,
          downloadLink: `/download/${outputFilename}`
        });
      } catch (error) {
        console.error(`Error converting file ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: 'Failed to convert file'
        });
      }
    }

    // Send all download links
    res.json({
      message: 'Files processed',
      results: results
    });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ error: 'Failed to process files' });
  }
});

// Handle file download
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../output', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Start the server on an available port
const startServer = async () => {
  const port = await findAvailablePort(initialPort);
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

// Start the server
startServer(); 