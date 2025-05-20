
import type { ResumeData } from '@/types/resume';
import Image from 'next/image';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  const { personalDetails, professionalDetails, objective } = resumeData;

  const renderBulletList = (items: string[]) => (
    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '5px 0' }}>
      {items.map((item, index) => (
        <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
      ))}
    </ul>
  );

  return (
    <div
      id="resume-preview-content"
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '210mm', 
        minHeight: '297mm', 
        display: 'flex',
        flexDirection: 'row',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)', 
        margin: '0 auto', // Center the preview in its container
        // Removed absolute positioning to make it visible in the layout flow
      }}
    >
      {/* Left Column */}
      <div
        style={{
          width: '30%',
          backgroundColor: '#30475E', 
          color: '#FFFFFF', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {personalDetails.photoPreview && (
          <div style={{ marginBottom: '20px', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', alignSelf: 'center' }}>
            <Image 
              src={personalDetails.photoPreview} 
              alt="User Photo" 
              width={120} 
              height={120} 
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              data-ai-hint="profile photo"
            />
          </div>
        )}
        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #FFFFFF', paddingBottom: '5px', marginBottom: '10px' }}>Contact</h2>
        <p style={{ fontSize: '12px', marginBottom: '5px' }}>{personalDetails.address}</p>
        <p style={{ fontSize: '12px', marginBottom: '5px' }}>{personalDetails.phone}</p>
        <p style={{ fontSize: '12px', marginBottom: '15px' }}>{personalDetails.email}</p>
        {personalDetails.linkedin && <p style={{ fontSize: '12px', marginBottom: '15px' }}>LinkedIn: {personalDetails.linkedin}</p>}

        {professionalDetails.strengths.length > 0 && (
          <>
            <h2 style={{ fontSize: '16px', borderBottom: '1px solid #FFFFFF', paddingBottom: '5px', marginBottom: '10px', marginTop: '10px' }}>Strengths</h2>
            <div style={{ fontSize: '12px' }}>
              {renderBulletList(professionalDetails.strengths)}
            </div>
          </>
        )}
        {professionalDetails.weaknesses.length > 0 && (
          <>
            <h2 style={{ fontSize: '16px', borderBottom: '1px solid #FFFFFF', paddingBottom: '5px', marginBottom: '10px', marginTop: '10px' }}>Weaknesses</h2>
            <div style={{ fontSize: '12px' }}>
              {renderBulletList(professionalDetails.weaknesses)}
            </div>
          </>
        )}
      </div>

      {/* Right Column */}
      <div
        style={{
          width: '70%',
          backgroundColor: '#FFFFFF', 
          color: '#000000', 
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#30475E', marginBottom: '15px', textAlign: 'center' }}>
          {personalDetails.name}
        </h1>
        
        {objective && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#39A2DB', borderBottom: '2px solid #39A2DB', paddingBottom: '5px', marginBottom: '10px' }}>Objective</h2>
            <p style={{ fontSize: '14px', marginBottom: '15px', lineHeight: '1.6' }}>{objective}</p>
          </>
        )}

        {professionalDetails.education.length > 0 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#39A2DB', borderBottom: '2px solid #39A2DB', paddingBottom: '5px', marginBottom: '10px' }}>Education</h2>
            {professionalDetails.education.map(edu => (
              <div key={edu.id} style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{edu.degree}</h3>
                <p style={{ fontSize: '14px', fontStyle: 'italic' }}>{edu.institution} - {edu.graduationYear}</p>
                {edu.details && <p style={{ fontSize: '13px' }}>{edu.details}</p>}
              </div>
            ))}
          </>
        )}
        
        {professionalDetails.skills.length > 0 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#39A2DB', borderBottom: '2px solid #39A2DB', paddingBottom: '5px', marginBottom: '10px', marginTop: '15px' }}>Skills</h2>
            <div style={{ fontSize: '14px' }}>
              {renderBulletList(professionalDetails.skills)}
            </div>
          </>
        )}

        {professionalDetails.experience.length > 0 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#39A2DB', borderBottom: '2px solid #39A2DB', paddingBottom: '5px', marginBottom: '10px', marginTop: '15px' }}>Experience</h2>
            {professionalDetails.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{exp.role} at {exp.company}</h3>
                <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '5px' }}>{exp.duration}</p>
                <div style={{ fontSize: '14px' }}>
                  {renderBulletList(exp.responsibilities)}
                </div>
              </div>
            ))}
          </>
        )}

        {professionalDetails.achievements.length > 0 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#39A2DB', borderBottom: '2px solid #39A2DB', paddingBottom: '5px', marginBottom: '10px', marginTop: '15px' }}>Achievements</h2>
            <div style={{ fontSize: '14px' }}>
             {renderBulletList(professionalDetails.achievements)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
