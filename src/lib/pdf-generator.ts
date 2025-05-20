// src/lib/pdf-generator.ts
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

  // Store original inline style attributes that might be modified or are crucial for restoration.
  // `resumeElement.style.width` will read the inline style value (e.g., "210mm").
  const originalInlineWidth = resumeElement.style.width;
  // `resumeElement.style.display` will read the inline style value (e.g., "flex").
  const originalInlineDisplay = resumeElement.style.display;

  // Prepare element for capture:
  // The ResumePreview component has inline styles: `display: 'flex'` and `width: '210mm'`.
  // We should not change `display` to 'block' if it's 'flex', as this can alter layout.
  // Maintaining 'flex' is important if the component's internal layout depends on it.
  // We ensure width is set for consistent capture size.
  resumeElement.style.width = '210mm'; 
  // The element is positioned off-screen. html2canvas should handle this.
  // If `originalInlineDisplay` was 'none', we might set `resumeElement.style.display = 'flex';` (or its natural display type) here.
  // But since it's already 'flex' (from ResumePreview's inline style), no change to `display` is needed for visibility.

  try {
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // Increase scale for better quality
      useCORS: true, // For images from other origins
      logging: true, // Enable html2canvas logging for easier debugging in browser console
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = pdfHeight;
    let currentPosition = 0;
    const pageHeightA4 = pdf.internal.pageSize.getHeight();

    // Add the first page/image segment
    pdf.addImage(imgData, 'PNG', 0, currentPosition, pdfWidth, pdfHeight);
    heightLeft -= pageHeightA4;

    // Add subsequent pages if content exceeds one page
    while (heightLeft > 0) {
      currentPosition -= pageHeightA4; // Adjust Y position for the segment of the image on new page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, currentPosition, pdfWidth, pdfHeight);
      heightLeft -= pageHeightA4;
    }
    
    const fileName = `${resumeData.personalDetails.name.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF. ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Restore original inline styles to ensure the element is back to its pre-capture state.
    resumeElement.style.width = originalInlineWidth;
    resumeElement.style.display = originalInlineDisplay;
  }
};
