// src/components/resume-form.tsx

// This line tells Next.js that this component should be rendered on the client-side.
// By default, components in the `app` directory are Server Components.
'use client';

import type { ChangeEvent, FormEvent } from 'react';
import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { generatePdf } from '@/lib/pdf-generator';
import { generateResumeObjective, type GenerateResumeObjectiveInput } from '@/ai/flows/generate-resume-objective';
import { analyzeJobDescription, type AnalyzeJobDescriptionInput } from '@/ai/flows/analyze-job-description';
import { enhanceResponsibility, type EnhanceResponsibilityInput } from '@/ai/flows/enhance-responsibility-flow';
import type { ResumeData, PersonalDetails, ProfessionalDetails, EducationEntry, ExperienceEntry, AiAnalysisState } from '@/types/resume';
import { initialResumeData, initialAiAnalysisState } from '@/types/resume';
import Image from 'next/image';
import { User, Mail, Phone, MapPin, Linkedin, Briefcase, GraduationCap, Award, Lightbulb, Sparkles, FileText, Trash2, PlusCircle, Loader2, Download, Brain, Wand2, Palette } from 'lucide-react';
import ResumePreview from './resume-preview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const personalDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  photo: z.any().optional(),
  photoPreview: z.string().optional().nullable(),
});

const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  graduationYear: z.string().min(1, 'Graduation year is required'),
  details: z.string().optional(),
});

const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().min(1, 'Duration is required'),
  responsibilities: z.array(z.string().min(1, 'Responsibility cannot be empty')).min(1, 'At least one responsibility is required'),
});

const professionalDetailsSchema = z.object({
  experience: z.array(experienceEntrySchema),
  education: z.array(educationEntrySchema),
  skills: z.array(z.string().min(1, 'Skill cannot be empty')),
  strengths: z.array(z.string().min(1, 'Strength cannot be empty')),
  weaknesses: z.array(z.string().min(1, 'Weakness cannot be empty')),
  achievements: z.array(z.string().min(1, 'Achievement cannot be empty')),
});

const resumeFormSchema = z.object({
  personalDetails: personalDetailsSchema,
  professionalDetails: professionalDetailsSchema,
  objective: z.string().optional(),
});

const leftColumnColorOptions = [
  { name: 'Pale Cream Yellow', value: '#FFF9E6', textColor: '#333333', skillTagBg: '#F3F4F6', skillTagTextColor: '#333333' },
  { name: 'Deep Blue (Classic)', value: '#30475E', textColor: '#FFFFFF', skillTagBg: '#4A6572', skillTagTextColor: '#FFFFFF' },
  { name: 'Light Steel Blue', value: '#B0C4DE', textColor: '#2c3e50', skillTagBg: '#D6EAF8', skillTagTextColor: '#2c3e50' },
  { name: 'Soft Teal', value: '#A0D2DB', textColor: '#285560', skillTagBg: '#E0F2F1', skillTagTextColor: '#285560' },
  { name: 'Misty Rose', value: '#FFE4E1', textColor: '#721c24', skillTagBg: '#FADBD8', skillTagTextColor: '#721c24' },
  { name: 'Earthy Brown', value: '#A0522D', textColor: '#FFFFFF', skillTagBg: '#D2B48C', skillTagTextColor: '#3A2B1D' },
  { name: 'Classic Red', value: '#C0392B', textColor: '#FFFFFF', skillTagBg: '#F5B7B1', skillTagTextColor: '#78281F' },
  { name: 'Forest Green', value: '#228B22', textColor: '#FFFFFF', skillTagBg: '#A9DFBF', skillTagTextColor: '#145A32' },
];


const ResumeForm: React.FC = () => {
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [aiState, setAiState] = useState<AiAnalysisState>(initialAiAnalysisState);
  const [activeTab, setActiveTab] = useState<string>("personal");

  const [isEnhancingResponsibility, setIsEnhancingResponsibility] = useState(false);
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<string[]>([]);
  const [currentResponsibilityData, setCurrentResponsibilityData] = useState<{
    experienceIndex: number;
    responsibilityIndex: number;
    originalText: string;
  } | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);

  const [selectedLeftColumnTheme, setSelectedLeftColumnTheme] = useState(leftColumnColorOptions[0]);

  const handleLeftColumnColorChange = (value: string) => {
    const selectedOption = leftColumnColorOptions.find(opt => opt.value === value) || leftColumnColorOptions[0];
    setSelectedLeftColumnTheme(selectedOption);
  };


  const { control, register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<ResumeData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: initialResumeData,
  });

  const watchedPersonalDetails = watch("personalDetails");
  const watchedProfessionalDetails = watch("professionalDetails");
  const watchedObjective = watch("objective");

  React.useEffect(() => {
    setResumeData(prev => ({
      ...prev,
      personalDetails: watchedPersonalDetails,
      professionalDetails: watchedProfessionalDetails,
      objective: watchedObjective || prev.objective,
    }));
  }, [watchedPersonalDetails, watchedProfessionalDetails, watchedObjective]);


  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "professionalDetails.education",
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "professionalDetails.experience",
  });

  const handleArrayFieldChange = (fieldName: keyof Omit<ProfessionalDetails, 'aiSuggestions'>, index: number, value: string) => {
    const currentArray = [...(watchedProfessionalDetails[fieldName] as string[])];
    currentArray[index] = value;
    setValue(`professionalDetails.${fieldName}` as any, currentArray, { shouldValidate: true });
  };

  const addArrayFieldItem = (fieldName: keyof Omit<ProfessionalDetails, 'aiSuggestions'>) => {
    const currentArray = [...(watchedProfessionalDetails[fieldName] as string[]), ''];
    setValue(`professionalDetails.${fieldName}` as any, currentArray, { shouldValidate: true });
  };

  const removeArrayFieldItem = (fieldName: keyof Omit<ProfessionalDetails, 'aiSuggestions'>, index: number) => {
    const currentArray = [...(watchedProfessionalDetails[fieldName] as string[])];
    currentArray.splice(index, 1);
    setValue(`professionalDetails.${fieldName}` as any, currentArray, { shouldValidate: true });
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('personalDetails.photoPreview', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
      setValue('personalDetails.photo', file, { shouldValidate: true });
    }
  };

  const handleGenerateObjective = async () => {
    setAiState(prev => ({ ...prev, isObjectiveLoading: true }));
    try {
      const input: GenerateResumeObjectiveInput = {
        skills: watchedProfessionalDetails.skills.join(', '),
        experience: watchedProfessionalDetails.experience.map(exp => `${exp.role} at ${exp.company}: ${exp.responsibilities.join('. ')}`).join('; '),
        strengths: watchedProfessionalDetails.strengths.join(', '),
        weaknesses: watchedProfessionalDetails.weaknesses.join(', '),
        jobAnalysis: aiState.analysisSuggestions || undefined,
      };
      const result = await generateResumeObjective(input);
      setValue('objective', result.objective, {shouldValidate: true});
      setAiState(prev => ({ ...prev, generatedObjective: result.objective, isObjectiveLoading: false }));
      toast({ title: 'Objective Generated', description: 'AI has crafted a resume objective for you.' });
    } catch (error) {
      console.error('Error generating objective:', error);
      toast({ title: 'Error', description: 'Failed to generate objective.', variant: 'destructive' });
      setAiState(prev => ({ ...prev, isObjectiveLoading: false }));
    }
  };

  const handleAnalyzeJobDescription = async () => {
    if (!aiState.jobDescription.trim()) {
      toast({ title: 'Job Description Empty', description: 'Please paste a job description to analyze.', variant: 'destructive'});
      return;
    }
    setAiState(prev => ({ ...prev, isAnalysisLoading: true }));
    try {
      const resumeDetailsString = `Skills: ${watchedProfessionalDetails.skills.join(', ')}; Experience: ${watchedProfessionalDetails.experience.map(exp => exp.role + " at " + exp.company).join(', ')}; Strengths: ${watchedProfessionalDetails.strengths.join(', ')}; Education: ${watchedProfessionalDetails.education.map(edu => edu.degree + " from " + edu.institution).join(', ')}.`;
      const input: AnalyzeJobDescriptionInput = {
        jobDescription: aiState.jobDescription,
        resumeDetails: resumeDetailsString,
      };
      const result = await analyzeJobDescription(input);
      setAiState(prev => ({ ...prev, analysisSuggestions: result.suggestions, isAnalysisLoading: false }));
      toast({ title: 'Analysis Complete', description: 'AI has provided suggestions based on the job description.' });
    } catch (error) {
      console.error('Error analyzing job description:', error);
      toast({ title: 'Error', description: 'Failed to analyze job description.', variant: 'destructive' });
      setAiState(prev => ({ ...prev, isAnalysisLoading: false }));
    }
  };

  const handleEnhanceResponsibilityClick = async (experienceIndex: number, responsibilityIndex: number, originalText: string) => {
    setCurrentResponsibilityData({ experienceIndex, responsibilityIndex, originalText });
    setIsEnhancingResponsibility(true);
    setEnhancementSuggestions([]); 

    try {
      const currentRole = watchedProfessionalDetails.experience[experienceIndex]?.role || '';
      const input: EnhanceResponsibilityInput = {
        originalResponsibility: originalText,
        role: currentRole,
        jobAnalysisContext: aiState.analysisSuggestions || undefined,
      };
      const result = await enhanceResponsibility(input);
      if (result.suggestedResponsibilities && result.suggestedResponsibilities.length > 0) {
        setEnhancementSuggestions(result.suggestedResponsibilities);
        setSelectedSuggestion(result.suggestedResponsibilities[0]); 
        setIsSuggestionDialogOpen(true);
      } else {
        toast({ title: 'No Suggestions', description: 'AI could not generate suggestions for this item.', variant: 'default' });
      }
    } catch (error) {
      console.error('Error enhancing responsibility:', error);
      toast({ title: 'Enhancement Failed', description: 'Could not get AI suggestions.', variant: 'destructive' });
    } finally {
      setIsEnhancingResponsibility(false);
    }
  };

  const handleApplySuggestion = () => {
    if (currentResponsibilityData && selectedSuggestion) {
      const { experienceIndex, responsibilityIndex } = currentResponsibilityData;
      const currentResponsibilities = [...getValues(`professionalDetails.experience.${experienceIndex}.responsibilities`)];
      currentResponsibilities[responsibilityIndex] = selectedSuggestion;
      setValue(`professionalDetails.experience.${experienceIndex}.responsibilities`, currentResponsibilities, { shouldValidate: true });

      setIsSuggestionDialogOpen(false);
      setCurrentResponsibilityData(null);
      setEnhancementSuggestions([]);
      setSelectedSuggestion('');
      toast({ title: 'Responsibility Updated', description: 'AI suggestion has been applied.' });
    }
  };


  const onSubmit = async (_data: ResumeData) => {
    setAiState(prev => ({...prev, isObjectiveLoading: true, isAnalysisLoading: true}));
    try {
      const currentFormData: ResumeData = {
        personalDetails: watchedPersonalDetails,
        professionalDetails: watchedProfessionalDetails,
        objective: watchedObjective || aiState.generatedObjective,
      };
      await generatePdf(currentFormData);
      toast({ title: 'PDF Generated', description: 'Your resume has been downloaded.' });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({ title: 'PDF Generation Failed', description: error.message || 'Could not generate PDF.', variant: 'destructive' });
    } finally {
      setAiState(prev => ({...prev, isObjectiveLoading: false, isAnalysisLoading: false}));
    }
  };

  const renderListInput = (label: string, fieldName: keyof Omit<ProfessionalDetails, 'aiSuggestions'>, Icon: React.ElementType) => (
    <div className="space-y-2">
      <Label htmlFor={fieldName} className="flex items-center"><Icon className="mr-2 h-4 w-4" />{label}</Label>
      {(watchedProfessionalDetails[fieldName] as string[] || []).map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input
            id={`${fieldName}-${index}`}
            value={item}
            onChange={(e) => handleArrayFieldChange(fieldName, index, e.target.value)}
            className="flex-grow"
            aria-label={`${label} item ${index + 1}`}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayFieldItem(fieldName, index)} aria-label={`Remove ${label} item ${index + 1}`}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => addArrayFieldItem(fieldName)} className="mt-2">
        <PlusCircle className="mr-2 h-4 w-4" /> Add {label.slice(0, -1)}
      </Button>
       {errors.professionalDetails?.[fieldName] && <p className="text-sm text-destructive">{(errors.professionalDetails?.[fieldName] as any)?.message || `Invalid ${label.toLowerCase()} entries.`}</p>}
    </div>
  );

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Card className="shadow-2xl lg:flex-1"> 
            <CardHeader className="bg-primary text-primary-foreground p-6 rounded-t-lg">
              <CardTitle className="text-3xl font-bold flex items-center">
                <Sparkles className="mr-3 h-8 w-8" /> Resumaker.ai
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-sm">Craft your perfect resume with AI assistance.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm rounded-none border-b">
                  <TabsTrigger value="personal">Personal Details</TabsTrigger>
                  <TabsTrigger value="professional">Professional Details</TabsTrigger>
                  <TabsTrigger value="ai-tools">AI Tools & Finalize</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="p-6">
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="flex items-center"><User className="mr-2 h-4 w-4" />Full Name</Label>
                        <Input id="name" {...register('personalDetails.name')} />
                        {errors.personalDetails?.name && <p className="text-sm text-destructive">{errors.personalDetails.name.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4" />Email Address</Label>
                        <Input id="email" type="email" {...register('personalDetails.email')} />
                        {errors.personalDetails?.email && <p className="text-sm text-destructive">{errors.personalDetails.email.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone" className="flex items-center"><Phone className="mr-2 h-4 w-4" />Phone Number</Label>
                        <Input id="phone" type="tel" {...register('personalDetails.phone')} />
                        {errors.personalDetails?.phone && <p className="text-sm text-destructive">{errors.personalDetails.phone.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="address" className="flex items-center"><MapPin className="mr-2 h-4 w-4" />Address</Label>
                        <Input id="address" {...register('personalDetails.address')} />
                        {errors.personalDetails?.address && <p className="text-sm text-destructive">{errors.personalDetails.address.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="linkedin" className="flex items-center"><Linkedin className="mr-2 h-4 w-4" />LinkedIn Profile URL (Optional)</Label>
                        <Input id="linkedin" {...register('personalDetails.linkedin')} />
                        {errors.personalDetails?.linkedin && <p className="text-sm text-destructive">{errors.personalDetails.linkedin.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="photo" className="flex items-center"><User className="mr-2 h-4 w-4" />Photo (Optional)</Label>
                        <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        {watchedPersonalDetails.photoPreview && (
                          <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-md">
                            <Image src={watchedPersonalDetails.photoPreview} alt="Photo Preview" width={96} height={96} className="object-cover w-full h-full" data-ai-hint="profile photo"/>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="leftColumnColor" className="flex items-center"><Palette className="mr-2 h-4 w-4" />Resume Accent Color (Left Column)</Label>
                        <Select value={selectedLeftColumnTheme.value} onValueChange={handleLeftColumnColorChange}>
                          <SelectTrigger id="leftColumnColor">
                            <SelectValue placeholder="Select a color theme" />
                          </SelectTrigger>
                          <SelectContent>
                            {leftColumnColorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: option.value, border: '1px solid #ccc' }}></span>
                                  {option.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="professional" className="p-6">
                  <CardContent className="space-y-8">
                    <section>
                      <h3 className="text-xl font-semibold mb-3 flex items-center"><GraduationCap className="mr-2 h-5 w-5 text-primary" />Education</h3>
                      {educationFields.map((field, index) => (
                        <Card key={field.id} className="mb-4 p-4 bg-muted/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`education-${index}-institution`}>Institution</Label>
                              <Input id={`education-${index}-institution`} {...register(`professionalDetails.education.${index}.institution`)} />
                              {errors.professionalDetails?.education?.[index]?.institution && <p className="text-sm text-destructive">{errors.professionalDetails.education[index]?.institution?.message}</p>}
                            </div>
                            <div>
                              <Label htmlFor={`education-${index}-degree`}>Degree/Certificate</Label>
                              <Input id={`education-${index}-degree`} {...register(`professionalDetails.education.${index}.degree`)} />
                              {errors.professionalDetails?.education?.[index]?.degree && <p className="text-sm text-destructive">{errors.professionalDetails.education[index]?.degree?.message}</p>}
                            </div>
                            <div>
                              <Label htmlFor={`education-${index}-graduationYear`}>Graduation Year</Label>
                              <Input id={`education-${index}-graduationYear`} {...register(`professionalDetails.education.${index}.graduationYear`)} />
                              {errors.professionalDetails?.education?.[index]?.graduationYear && <p className="text-sm text-destructive">{errors.professionalDetails.education[index]?.graduationYear?.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor={`education-${index}-details`}>Details (Optional)</Label>
                              <Textarea id={`education-${index}-details`} {...register(`professionalDetails.education.${index}.details`)} />
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)} className="mt-2 text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-1 h-4 w-4" /> Remove Education
                          </Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendEducation({ id: Date.now().toString(), institution: '', degree: '', graduationYear: '', details: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                      </Button>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold mb-3 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Experience</h3>
                      {experienceFields.map((field, expIndex) => (
                        <Card key={field.id} className="mb-4 p-4 bg-muted/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`experience-${expIndex}-company`}>Company</Label>
                              <Input id={`experience-${expIndex}-company`} {...register(`professionalDetails.experience.${expIndex}.company`)} />
                              {errors.professionalDetails?.experience?.[expIndex]?.company && <p className="text-sm text-destructive">{errors.professionalDetails.experience[expIndex]?.company?.message}</p>}
                            </div>
                            <div>
                              <Label htmlFor={`experience-${expIndex}-role`}>Role/Position</Label>
                              <Input id={`experience-${expIndex}-role`} {...register(`professionalDetails.experience.${expIndex}.role`)} />
                              {errors.professionalDetails?.experience?.[expIndex]?.role && <p className="text-sm text-destructive">{errors.professionalDetails.experience[expIndex]?.role?.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor={`experience-${expIndex}-duration`}>Duration (e.g., Jan 2020 - Present)</Label>
                              <Input id={`experience-${expIndex}-duration`} {...register(`professionalDetails.experience.${expIndex}.duration`)} />
                              {errors.professionalDetails?.experience?.[expIndex]?.duration && <p className="text-sm text-destructive">{errors.professionalDetails.experience[expIndex]?.duration?.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <Label>Responsibilities</Label>
                              <Controller
                                  control={control}
                                  name={`professionalDetails.experience.${expIndex}.responsibilities`}
                                  render={({ field: { onChange, value = [] } }) => (
                                    <>
                                      {(value || []).map((resp, rIndex) => (
                                        <div key={rIndex} className="flex items-center space-x-2 mb-2">
                                          <Input
                                            value={resp}
                                            onChange={(e) => {
                                              const newVal = [...value];
                                              newVal[rIndex] = e.target.value;
                                              onChange(newVal);
                                            }}
                                            placeholder={`Responsibility ${rIndex + 1}`}
                                            className="flex-grow"
                                          />
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEnhanceResponsibilityClick(expIndex, rIndex, value[rIndex])}
                                            disabled={isEnhancingResponsibility && currentResponsibilityData?.experienceIndex === expIndex && currentResponsibilityData?.responsibilityIndex === rIndex}
                                            aria-label="Enhance with AI"
                                            title="Enhance with AI"
                                          >
                                            {(isEnhancingResponsibility && currentResponsibilityData?.experienceIndex === expIndex && currentResponsibilityData?.responsibilityIndex === rIndex) ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Wand2 className="h-4 w-4" />
                                            )}
                                          </Button>
                                          <Button type="button" variant="ghost" size="icon" onClick={() => {
                                            const newVal = [...value];
                                            newVal.splice(rIndex, 1);
                                            onChange(newVal);
                                          }}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, ''])}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Responsibility
                                      </Button>
                                    </>
                                  )}
                                />
                                {errors.professionalDetails?.experience?.[expIndex]?.responsibilities && <p className="text-sm text-destructive">{(errors.professionalDetails.experience[expIndex]?.responsibilities as any)?.message || 'Responsibilities error'}</p>}
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(expIndex)} className="mt-2 text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-1 h-4 w-4" /> Remove Experience
                          </Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendExperience({ id: Date.now().toString(), company: '', role: '', duration: '', responsibilities: [''] })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                      </Button>
                    </section>

                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {renderListInput("Skills", "skills", Lightbulb)}
                      {renderListInput("Strengths", "strengths", Sparkles)}
                      {renderListInput("Weaknesses", "weaknesses", Brain)}
                      {renderListInput("Achievements", "achievements", Award)}
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="ai-tools" className="p-6">
                  <CardContent className="space-y-8">
                     <section>
                      <h3 className="text-xl font-semibold mb-3 flex items-center"><Sparkles className="mr-2 h-5 w-5 text-accent" />AI Job Description Analysis (Optional)</h3>
                      <Label htmlFor="jobDescription">Paste Job Description Here</Label>
                      <Textarea
                        id="jobDescription"
                        placeholder="Paste the job description text here for AI analysis..."
                        rows={8}
                        value={aiState.jobDescription}
                        onChange={(e) => setAiState(prev => ({ ...prev, jobDescription: e.target.value }))}
                        className="mb-2"
                      />
                      <Button type="button" onClick={handleAnalyzeJobDescription} disabled={aiState.isAnalysisLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        {aiState.isAnalysisLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Analyze Job Description
                      </Button>
                      {aiState.analysisSuggestions && (
                        <Card className="mt-4 bg-muted/30">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent" />AI Suggestions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{aiState.analysisSuggestions}</p>
                          </CardContent>
                        </Card>
                      )}
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold mb-3 flex items-center"><FileText className="mr-2 h-5 w-5 text-accent" />Resume Objective</h3>
                      <Textarea
                        id="objective"
                        placeholder="Enter your resume objective or generate one with AI."
                        rows={4}
                        {...register('objective')}
                        className="mb-2"
                      />
                      <Button type="button" onClick={handleGenerateObjective} disabled={aiState.isObjectiveLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        {aiState.isObjectiveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Objective with AI
                      </Button>
                      {errors.objective && <p className="text-sm text-destructive">{errors.objective.message}</p>}
                    </section>
                  </CardContent>
                  <CardFooter className="p-6 border-t mt-6">
                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={aiState.isObjectiveLoading || aiState.isAnalysisLoading || isEnhancingResponsibility}>
                      {(aiState.isObjectiveLoading || aiState.isAnalysisLoading || isEnhancingResponsibility) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Download className="mr-2 h-5 w-5" /> Generate & Download PDF
                    </Button>
                  </CardFooter>
                </TabsContent>
              </Tabs>
            </form>
          </Card>

          <div className="hidden lg:block lg:w-1/2 sticky top-8 self-start">
            <Card className="shadow-lg">
              <CardHeader className="bg-secondary">
                <CardTitle className="text-xl text-secondary-foreground">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-2" style={{ maxHeight: 'calc(100vh - 10rem)', overflowY: 'auto' }}>
                <div className="p-2 bg-white rounded">
                   <ResumePreview 
                    resumeData={resumeData} 
                    leftColumnBgColor={selectedLeftColumnTheme.value}
                    leftColumnTextColor={selectedLeftColumnTheme.textColor}
                    skillTagBgColor={selectedLeftColumnTheme.skillTagBg}
                    skillTagTextColor={selectedLeftColumnTheme.skillTagTextColor}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isSuggestionDialogOpen} onOpenChange={(isOpen) => {
        setIsSuggestionDialogOpen(isOpen);
        if (!isOpen) {
          setCurrentResponsibilityData(null);
          setEnhancementSuggestions([]);
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>AI-Powered Suggestions</DialogTitle>
            <DialogDescription>
              Choose an enhanced version for your responsibility or cancel to keep the original.
              Original: "{currentResponsibilityData?.originalText}"
            </DialogDescription>
          </DialogHeader>
          {enhancementSuggestions.length > 0 ? (
            <RadioGroup value={selectedSuggestion} onValueChange={setSelectedSuggestion} className="my-4 space-y-2">
              {enhancementSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value={suggestion} id={`suggestion-${index}`} />
                  <Label htmlFor={`suggestion-${index}`} className="flex-1 cursor-pointer">{suggestion}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <p className="my-4 text-sm text-muted-foreground">No suggestions available at the moment.</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setIsSuggestionDialogOpen(false);
              setCurrentResponsibilityData(null);
              setEnhancementSuggestions([]);
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={handleApplySuggestion} disabled={!selectedSuggestion}>
              Apply Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeForm;

    