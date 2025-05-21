
'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ResumeData } from '@/types/resume';

export const generatePdf = async (resumeData: ResumeData): Promise<void> => {
  const resumeElement = document.getElementById('resume-preview-content');
  if (!resumeElement) {
    console.error('Resume preview element not found');
    throw new Error('Resume preview element not found. Cannot generate PDF.');
  }

  // Store original inline style attributes that might be modified.
  const originalInlineWidth = resumeElement.style.width;
  const originalInlineDisplay = resumeElement.style.display;
  // The ResumePreview component itself sets width: '210mm' and display: 'flex'.
  // We ensure width is '210mm' for capture.
  resumeElement.style.width = '210mm';
  // Ensure the element is treated as 'flex' if it has specific flex children behavior,
  // which it does. This should match its original display style from React.
  resumeElement.style.display = 'flex';


  // Get the computed dimensions in pixels *after* styles are applied.
  // These are used to hint html2canvas about the capture area.
  const elementWidthPx = resumeElement.offsetWidth;
  const elementHeightPx = resumeElement.scrollHeight; // Use scrollHeight to capture full content

  try {
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // Increase scale for better quality
      useCORS: true, // For images from other origins
      logging: true, // Enable html2canvas logging for easier debugging
      width: elementWidthPx, // Explicitly set canvas width
      height: elementHeightPx, // Explicitly set canvas height
      windowWidth: elementWidthPx, // Hint the "window" width for rendering
      windowHeight: elementHeightPx, // Hint the "window" height for rendering
      scrollX: 0, // Ensure no unintended scroll offset is applied by html2canvas
      scrollY: 0,
      x: 0, // Start capture from the top-left of the element
      y: 0,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4', // A4 dimensions: 210mm x 297mm
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfPageWidth = pdf.internal.pageSize.getWidth(); // e.g., 210mm for A4 portrait
    // Calculate the image height in PDF units, maintaining aspect ratio
    const pdfImageHeight = (imgProps.height * pdfPageWidth) / imgProps.width;
    
    let heightLeft = pdfImageHeight;
    let position = 0; // Current Y position in PDF
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // e.g., 297mm for A4

    // Add the first page (or segment of the image)
    pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, pdfImageHeight);
    heightLeft -= pdfPageHeight;

    // Add more pages if the image height exceeds the page height
    while (heightLeft > 0) {
      position -= pdfPageHeight; // New Y position for the image segment on the next page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, pdfImageHeight);
      heightLeft -= pdfPageHeight;
    }
    
    const fileName = `${resumeData.personalDetails.name.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    // Ensure the error message is useful.
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate PDF. ${errorMessage}`);
  } finally {
    // Restore original inline styles to ensure the element is back to its pre-capture state.
    resumeElement.style.width = originalInlineWidth;
    resumeElement.style.display = originalInlineDisplay;
  }
};
