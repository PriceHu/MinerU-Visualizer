# MinerU Visualizer

> **Note:** This project was created using Google AI Studio with the Gemini 3 Pro model.

MinerU Visualizer is a web-based tool designed to visualize layout analysis results on PDF documents. It allows users to overlay bounding boxes from a JSON parser output (specifically formatted for MinerU/Magic-PDF) onto the original PDF document to inspect detection accuracy and structure.

## Demo

The application is deployed at: https://pricehu.github.io/MinerU-Visualizer/

## Features

- **PDF & JSON Upload**: Upload a PDF file and its corresponding JSON analysis result.
- **Layout Visualization**: Overlays colored bounding boxes for different content types (Text, Title, Table, Image, Formula, etc.).
- **Interactive Inspection**: Click on any bounding box to view detailed information, including coordinates, raw content, and HTML representation (for tables).
- **Layer Control**: Toggle visibility for specific content types to focus on specific elements.
- **Zoom & Navigation**: Standard PDF navigation tools including zoom in/out.

## Getting Started

1. Open the application in your browser.
2. **Upload PDF**: Click on the first upload box to select your source PDF document.
3. **Upload JSON**: Click on the second upload box to select the parsing result JSON file.
   - The tool supports the standard `pdf_info` JSON format produced by layout analysis tools.
4. The PDF will render in the main view with overlays.
5. Use the sidebar to toggle layers or inspect specific blocks.

## Development

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
npm install --legacy-peer-deps
```

### Running Locally

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment is handled by a GitHub Actions workflow.

## JSON Format

The tool expects a JSON structure similar to:

```json
{
  "pdf_info": [
    {
      "page_idx": 0,
      "page_size": [595, 842],
      "para_blocks": [
        {
          "type": "text",
          "bbox": [50, 100, 500, 120],
          "lines": [...]
        },
        ...
      ]
    },
    ...
  ]
}
```

## Technologies

- **React**: UI Framework.
- **react-pdf**: For rendering PDF documents.
- **Tailwind CSS**: For styling.
- **Lucide React**: For icons.

## Privacy & Local Processing

This application is designed with privacy in mind. All file processing and visualization happens **locally in your browser**:

- **No Cloud Uploads**: Files you upload (PDF and JSON) never leave your device. They are processed entirely client-side using the browser's FileReader API.
- **Local Rendering**: PDF rendering is handled locally by PDF.js.
- **No External APIs**: The application does not make any API calls to external services for processing your documents.
- **Offline Capable**: Once loaded, the application works offline (except for initial loading of UI libraries from CDN).

The only external resources loaded are standard frontend libraries (Tailwind CSS, fonts, React, and PDF.js worker) which are typical for modern web applications and do not have access to your uploaded files.

## License

MIT