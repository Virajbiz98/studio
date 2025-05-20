
import type { ResumeData } from '@/types/resume';
import Image from 'next/image';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  const { personalDetails, professionalDetails, objective } = resumeData;

  const pâleCreamYellow = '#FFF9E6'; // A bit more yellow than FFFBEF
  const darkText = '#333333';
  const headerBlue = '#EFF6FF'; // Light blue for header
  const accentTeal = '#39A2DB';
  const primaryDeepBlue = '#30475E';
  const skillTagBg = '#F3F4F6'; // Light gray for skill tags

  const renderBulletList = (items: string[], itemStyle?: React.CSSProperties) => (
    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '5px 0 0 0' }}>
      {items.map((item, index) => (
        <li key={index} style={{ marginBottom: '4px', ...itemStyle }}>{item}</li>
      ))}
    </ul>
  );

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: primaryDeepBlue,
    borderBottom: `2px solid ${accentTeal}`,
    paddingBottom: '3px',
    marginBottom: '10px',
    textTransform: 'uppercase',
  };

  const leftColumnSectionTitleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: primaryDeepBlue, // Dark text for left column titles
    paddingBottom: '3px',
    marginBottom: '8px',
    textTransform: 'uppercase',
  };

  const skillItemStyle: React.CSSProperties = {
    backgroundColor: skillTagBg,
    padding: '5px 10px',
    borderRadius: '4px',
    marginBottom: '6px',
    fontSize: '11px',
    color: darkText,
    borderBottom: `2px solid ${primaryDeepBlue}`,
    display: 'block',
  };

  return (
    <div
      id="resume-preview-content"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        width: '210mm', 
        minHeight: '297mm', 
        display: 'flex',
        flexDirection: 'row',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)', 
        margin: '0 auto',
        backgroundColor: '#FFFFFF', // Overall background for the page
      }}
    >
      {/* Left Column */}
      <div
        style={{
          width: '35%', // Adjusted width
          backgroundColor: pâleCreamYellow, 
          color: darkText, 
          padding: '25px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative', // For photo positioning if needed
        }}
      >
        {personalDetails.photoPreview && (
          <div style={{ 
            marginBottom: '25px', 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            alignSelf: 'center',
            border: `3px solid ${primaryDeepBlue}`
          }}>
            <Image 
              src={personalDetails.photoPreview} 
              alt="User Photo" 
              width={100} 
              height={100} 
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              data-ai-hint="profile photo"
            />
          </div>
        )}

        <h2 style={leftColumnSectionTitleStyle}>Personal Info</h2>
        <p style={{ fontSize: '11px', marginBottom: '3px' }}>{personalDetails.email}</p>
        <p style={{ fontSize: '11px', marginBottom: '3px' }}>{personalDetails.phone}</p>
        <p style={{ fontSize: '11px', marginBottom: '15px' }}>{personalDetails.address}</p>
        {personalDetails.linkedin && <p style={{ fontSize: '11px', marginBottom: '15px', wordBreak: 'break-all' }}>LinkedIn: {personalDetails.linkedin}</p>}

        {professionalDetails.education.length > 0 && (
          <>
            <h2 style={{...leftColumnSectionTitleStyle, marginTop: '15px' }}>Education</h2>
            {professionalDetails.education.map(edu => (
              <div key={edu.id} style={{ marginBottom: '10px', fontSize: '11px' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>{edu.degree}</p>
                <p style={{ margin: '0 0 2px 0' }}>{edu.institution}</p>
                <p style={{ fontStyle: 'italic', margin: '0' }}>{edu.graduationYear}</p>
                {edu.details && <p style={{ fontSize: '10px', marginTop: '3px' }}>{edu.details}</p>}
              </div>
            ))}
          </>
        )}

        {professionalDetails.skills.length > 0 && (
          <>
            <h2 style={{...leftColumnSectionTitleStyle, marginTop: '15px' }}>Skills</h2>
            {professionalDetails.skills.map((skill, index) => (
              <span key={index} style={skillItemStyle}>{skill}</span>
            ))}
          </>
        )}

        {professionalDetails.strengths.length > 0 && (
          <>
            <h2 style={{...leftColumnSectionTitleStyle, marginTop: '15px' }}>Strengths</h2>
             {professionalDetails.strengths.map((strength, index) => (
              <span key={index} style={skillItemStyle}>{strength}</span>
            ))}
          </>
        )}
        {professionalDetails.weaknesses.length > 0 && (
          <>
            <h2 style={{...leftColumnSectionTitleStyle, marginTop: '15px' }}>Weaknesses</h2>
            {professionalDetails.weaknesses.map((weakness, index) => (
              <span key={index} style={skillItemStyle}>{weakness}</span>
            ))}
          </>
        )}
      </div>

      {/* Right Column */}
      <div
        style={{
          width: '65%', // Adjusted width
          color: darkText, 
          padding: '0', // Padding handled by inner container
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Name and Title Header */}
        <div style={{ backgroundColor: headerBlue, padding: '30px 25px 20px 25px', textAlign: 'left' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: primaryDeepBlue, marginBottom: '5px', lineHeight: '1.1' }}>
            {personalDetails.name || "Your Name"}
          </h1>
          {/* You can add a field for "Title/Profession" in personalDetails or professionalDetails if needed */}
          <p style={{ fontSize: '16px', color: primaryDeepBlue, margin: '0' }}>{/* Example: Web Developer / Project Manager */}</p> 
        </div>

        <div style={{padding: '20px 25px 25px 25px', flexGrow: 1}}> {/* Content padding for right column */}
          {objective && (
            <section style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitleStyle}>Summary</h2>
              <p style={{ fontSize: '12px', lineHeight: '1.6', color: darkText }}>{objective}</p>
            </section>
          )}
          
          {professionalDetails.experience.length > 0 && (
            <section style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitleStyle}>Work Experience</h2>
              {professionalDetails.experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: primaryDeepBlue, margin: '0 0 2px 0' }}>{exp.role}</h3>
                  <p style={{ fontSize: '12px', fontWeight: 'normal', color: darkText, margin: '0 0 2px 0' }}>{exp.company}</p>
                  <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#555555', marginBottom: '5px' }}>{exp.duration}</p>
                  {renderBulletList(exp.responsibilities, { fontSize: '12px', color: darkText })}
                </div>
              ))}
            </section>
          )}

          {professionalDetails.achievements.length > 0 && (
            <section style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitleStyle}>Achievements</h2>
              <div style={{ fontSize: '12px', color: darkText }}>
               {renderBulletList(professionalDetails.achievements)}
              </div>
            </section>
          )}

          <section>
            <h2 style={sectionTitleStyle}>References</h2>
            <p style={{ fontSize: '12px', fontStyle: 'italic', color: darkText }}>References available upon request.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
