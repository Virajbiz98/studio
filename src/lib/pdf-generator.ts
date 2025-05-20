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

  // Temporarily make it visible if it's display: none
  const originalDisplay = resumeElement.style.display;
  resumeElement.style.display = 'block';
  // Ensure fixed dimensions for A4-like rendering
  resumeElement.style.width = '210mm';
  // resumeElement.style.height = '297mm'; // Height can be auto to fit content, jspdf will handle multi-page

  try {
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // Increase scale for better quality
      useCORS: true, // For images from other origins if any
      logging: true,
      onclone: (document) => {
        // Fix for images not rendering in html2canvas
        // This is a common workaround: re-query and set image sources if necessary
        // For photoPreview, it should be a data URL or blob URL, which usually works fine
      }
    });
    
    // Restore original display
    resumeElement.style.display = originalDisplay;
    resumeElement.style.width = ''; // Reset width
    // resumeElement.style.height = ''; // Reset height

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
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    
    const fileName = `${resumeData.personalDetails.name.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    // Restore original display in case of error
    resumeElement.style.display = originalDisplay;
    resumeElement.style.width = '';
    // resumeElement.style.height = '';
    throw new Error('Failed to generate PDF. Check console for details.');
  }
};
