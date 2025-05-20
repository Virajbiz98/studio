# Resumaker.ai

Resumaker.ai is a web application built with NextJS that simplifies the process of creating professional resumes. It offers an intuitive form-based input, optional AI-powered job description analysis to enhance your resume content, and generates a clean, two-column PDF resume.

To get started, take a look at src/app/page.tsx.

## How to Run the Code

### Prerequisites

Make sure you have Node.js and npm installed.

### Setup

1. Clone the repository: `git clone [repository URL]`
2. Navigate to the project directory: `cd resumaker.ai`
3. Install dependencies: `npm install`

### Running the Development Server

To run this code locally in your terminal:

Start the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Core Features

- **Form Input:** An intuitive form for users to input personal and professional details.
- **AI Resume Tool:** Optional AI-powered analysis of job descriptions using the Gemini API to suggest resume improvements, incorporating key facts from the job description.
- **PDF Generation:** Generates a professional, two-column resume PDF with a blue accent color, downloadable with a filename based on the user's name.
- **Photo Upload:** Functionality to upload and preview a photo for personalization (photo does not appear in the final PDF).
- **Visual Appeal:** Clean and modern UI design with clear section headers, bullet points, and proper text alignment, enhanced by Font Awesome icons in the form (icons do not appear in the final PDF).

## Style Guidelines

- **Primary Color:** Deep Blue (`#30475E`) for professionalism and trust.
- **Background Color:** Light Gray (`#F2F4F7`) for readability and a modern feel.
- **Accent Color:** Teal (`#39A2DB`) to provide visual interest and highlight key elements.
- Uses clear, professional, sans-serif fonts for both form inputs and the generated PDF.
- Incorporates subtle animations (e.g., fade-in effects) for improved user experience.
