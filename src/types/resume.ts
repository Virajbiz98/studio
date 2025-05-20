
export interface PersonalDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  linkedin: string;
  photo?: File | null;
  photoPreview?: string | null;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  graduationYear: string;
  details?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  duration: string;
  responsibilities: string[];
}

export interface ProfessionalDetails {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  achievements: string[];
  // aiSuggestions was here, now removed
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  professionalDetails: ProfessionalDetails;
  objective: string; 
}

export interface AiAnalysisState {
  jobDescription: string;
  generatedObjective: string;
  analysisSuggestions: string; // This state can still exist for display in the UI, just not for PDF
  isObjectiveLoading: boolean;
  isAnalysisLoading: boolean;
}

export const initialPersonalDetails: PersonalDetails = {
  name: '',
  address: '',
  phone: '',
  email: '',
  linkedin: '',
  photo: null,
  photoPreview: null,
};

export const initialProfessionalDetails: ProfessionalDetails = {
  experience: [],
  education: [],
  skills: [],
  strengths: [],
  weaknesses: [],
  achievements: [],
  // aiSuggestions initialization removed
};

export const initialResumeData: ResumeData = {
  personalDetails: initialPersonalDetails,
  professionalDetails: initialProfessionalDetails,
  objective: '',
};

export const initialAiAnalysisState: AiAnalysisState = {
  jobDescription: '',
  generatedObjective: '',
  analysisSuggestions: '',
  isObjectiveLoading: false,
  isAnalysisLoading: false,
};
