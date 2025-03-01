"use client";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const PDFViewer = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="flex flex-col items-center bg-gray-900 text-gray-100 min-h-full">
      <div className="sticky top-0 z-10 bg-gray-800 bg-opacity-90 backdrop-blur-sm w-full mb-4 shadow-md">
        <div className="flex items-center justify-between space-x-2 p-3">
          <div className="flex items-center space-x-2">
            <Button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
            <Input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= (numPages || 1)) {
                  setPageNumber(value);
                }
              }}
              className="w-16 text-center bg-gray-700 border-gray-600 text-white"
            />
            <Button
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-400">of {numPages || "--"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={zoomOut}
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-400">
              {Math.round(scale * 100)}%
            </span>
            <Button
              onClick={zoomIn}
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="max-h-[calc(100vh-12rem)] overflow-auto w-full px-4 pb-4">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center w-full"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            className="max-w-full shadow-lg rounded-lg overflow-hidden"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
