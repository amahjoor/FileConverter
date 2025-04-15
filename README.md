# PPTX to PDF Converter

A simple web application that allows users to convert PowerPoint presentations (.ppt and .pptx) to PDF format.

## Features

- Upload PowerPoint files (.ppt, .pptx)
- Convert to PDF format
- Download the converted PDF file
- Modern and responsive UI

## Prerequisites

Before running this application, you need to have the following installed:

- Node.js (v12 or higher)
- LibreOffice (for the conversion)

### Installing LibreOffice

#### macOS
```
brew install libreoffice
```

#### Ubuntu/Debian
```
sudo apt-get install libreoffice
```

#### Windows
Download and install from [LibreOffice official website](https://www.libreoffice.org/download/download/)

## Installation

1. Clone this repository
```
git clone <repository-url>
cd pptxToPDF
```

2. Install dependencies
```
npm install
```

3. Start the server
```
npm start
```

For development with auto-restart:
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. Click on "Choose file" to select a PowerPoint presentation
2. Click "Convert to PDF" to start the conversion process
3. Once conversion is complete, click "Download PDF" to download your converted file

## Technical Details

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Conversion: LibreOffice (via libreoffice-convert library)
- File handling: Multer

## License

ISC 