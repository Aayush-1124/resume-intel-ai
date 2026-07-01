import { forwardRef, memo } from 'react';

/* ═══════════════════════════════════════════════════
   CLASSIC TEMPLATE — Traditional serif, centred header
   ═══════════════════════════════════════════════════ */
const ClassicTemplate = memo(function ClassicTemplate({ data }) {
  const { personal = {}, experience = [], education = [], skills = {} } = data;

  return (
    <div style={{
      fontFamily: "'Times New Roman', Times, serif",
      color: '#000',
      padding: '48px 56px',
      height: '100%',
      background: '#fff',
      lineHeight: 1.5,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '1px' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 8px', fontSize: '12px', color: '#111' }}>
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && <><span>·</span><span>{personal.phone}</span></>}
          {personal.email && <><span>·</span><a href={`mailto:${personal.email}`} style={{color: '#000', textDecoration: 'none'}}>{personal.email}</a></>}
          {personal.linkedin && <><span>·</span><a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} style={{color: '#000', textDecoration: 'none'}}>{personal.linkedin.replace(/^https?:\/\//, '')}</a></>}
          {personal.website && <><span>·</span><a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} style={{color: '#000', textDecoration: 'none'}}>{personal.website.replace(/^https?:\/\//, '')}</a></>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <Section title="SUMMARY">
          <p style={{ fontSize: '12.5px', margin: 0, textAlign: 'justify' }}>{personal.summary}</p>
        </Section>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.languages?.length > 0 || skills.soft?.length > 0) && (
        <Section title="TECHNICAL SKILLS">
          <div style={{ fontSize: '12.5px' }}>
            {skills.technical?.map((skill, i) => {
              if (skill.includes(':')) {
                const [label, ...rest] = skill.split(':');
                return (
                  <div key={i} style={{ marginBottom: '2px' }}>
                    <strong>{label}:</strong>{rest.join(':')}
                  </div>
                );
              }
              return <div key={i} style={{ marginBottom: '2px' }}>{skill}</div>;
            })}
            {skills.languages?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Languages:</strong> {skills.languages.join(', ')}</div>}
            {skills.soft?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Soft Skills:</strong> {skills.soft.join(', ')}</div>}
          </div>
        </Section>
      )}

      {/* Experience */}
      {experience.some((e) => e.title) && (
        <Section title="EXPERIENCE">
          {experience.filter((e) => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '12.5px' }}>
                  <strong>{exp.title}</strong>
                  {exp.company && <span> · {exp.company}</span>}
                  {exp.location && <span>, {exp.location}</span>}
                </div>
                <span style={{ fontSize: '12.5px', fontStyle: 'italic', color: '#333' }}>
                  {exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}
                </span>
              </div>
              <ul style={{ margin: '4px 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ fontSize: '12.5px', marginBottom: '3px', textAlign: 'justify' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.some((e) => e.institution) && (
        <Section title="EDUCATION">
          {education.filter((e) => e.institution).map((edu, i) => (
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', fontSize: '12.5px' }}>
                <div>
                  <strong>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong>
                  {edu.institution && <span> · {edu.institution}</span>}
                </div>
                <div style={{ color: '#333', fontStyle: 'italic' }}>
                  {edu.graduationYear}{edu.achievements && ` · ${edu.achievements}`}
                </div>
             </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {skills.certifications?.length > 0 && (
        <Section title="CERTIFICATIONS">
          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
            {skills.certifications.map((cert, i) => (
              <li key={i} style={{ fontSize: '12.5px', marginBottom: '3px' }}>{cert}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
});

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '14px', fontWeight: 900, textTransform: 'uppercase',
        borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 8px 0',
      }}>{title}</h2>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MODERN TEMPLATE — Dark sidebar, two-column
   ═══════════════════════════════════════════════════ */
const ModernTemplate = memo(function ModernTemplate({ data }) {
  const { personal = {}, experience = [], education = [], skills = {} } = data;

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Arial', 'Helvetica', sans-serif", background: '#fff' }}>

      {/* Sidebar */}
      <div style={{ width: '32%', background: '#1d00a5', color: '#fff', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          {(personal.fullName || 'Your Name').split(' ').map((n, i) => (
            <div key={i} style={{ fontSize: i === 0 ? '22px' : '20px', fontWeight: 900, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{n}</div>
          ))}
          <div style={{ width: '28px', height: '3px', background: '#c3c0ff', margin: '12px 0' }} />
          {[personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).map((v, i) => (
            <p key={i} style={{ fontSize: '10px', opacity: 0.85, margin: '4px 0', wordBreak: 'break-all' }}>{v}</p>
          ))}
        </div>

        {/* Skills sidebar */}
        {skills.technical?.length > 0 && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '10px' }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[...(skills.technical || []), ...(skills.languages || [])].slice(0, 14).map((s) => (
                <span key={s} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '3px 8px', fontSize: '9px', fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {skills.soft?.length > 0 && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>Soft Skills</p>
            {skills.soft.slice(0, 6).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#c3c0ff', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', opacity: 0.9 }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {education.filter((e) => e.institution).length > 0 && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '10px' }}>Education</p>
            {education.filter((e) => e.institution).map((edu, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, margin: 0 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                <p style={{ fontSize: '10px', opacity: 0.8, margin: '2px 0' }}>{edu.institution}</p>
                <p style={{ fontSize: '9px', opacity: 0.6, margin: 0 }}>{edu.graduationYear}</p>
              </div>
            ))}
          </div>
        )}

        {skills.certifications?.length > 0 && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>Certifications</p>
            {skills.certifications.map((c) => <p key={c} style={{ fontSize: '10px', opacity: 0.85, margin: '3px 0' }}>• {c}</p>)}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
        {personal.summary && (
          <div>
            <MLabel>Profile</MLabel>
            <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.65, margin: 0 }}>{personal.summary}</p>
          </div>
        )}

        {experience.filter((e) => e.title).length > 0 && (
          <div>
            <MLabel>Experience</MLabel>
            {experience.filter((e) => e.title).map((exp, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '14px', color: '#191c1e' }}>{exp.title}</strong>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' — ' : ''}{exp.endDate}</span>
                </div>
                <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#1d00a5', textTransform: 'uppercase', margin: '4px 0 6px' }}>
                  {exp.company}{exp.company && exp.location ? ' • ' : ''}{exp.location}
                </p>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1d00a5', flexShrink: 0, marginTop: '6px' }} />
                    <span style={{ fontSize: '11.5px', color: '#333', lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
function MLabel({ children }) {
  return <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#aaa', marginBottom: '10px' }}>{children}</p>;
}

/* ═══════════════════════════════════════════════════
   MINIMAL TEMPLATE — Editorial asymmetric grid
   ═══════════════════════════════════════════════════ */
const MinimalTemplate = memo(function MinimalTemplate({ data }) {
  const { personal = {}, experience = [], education = [], skills = {} } = data;
  const hasSkills = Object.values(skills).some((a) => a?.length > 0);

  const Row = ({ label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '20px', marginBottom: '24px' }}>
      <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#bbb', paddingTop: '2px' }}>{label}</p>
      <div>{children}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", color: '#191c1e', padding: '48px', height: '100%', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '24px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
            {personal.fullName || 'Your Name'}
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).map((v, i) => (
            <p key={i} style={{ fontSize: '11px', color: '#666', margin: '3px 0' }}>{v}</p>
          ))}
          {personal.website && <p style={{ fontSize: '11px', fontWeight: 700, color: '#3525cd', margin: '3px 0' }}>{personal.website}</p>}
        </div>
      </div>

      {personal.summary && (
        <Row label="Profile">
          <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{personal.summary}</p>
        </Row>
      )}

      {experience.filter((e) => e.title).length > 0 && (
        <Row label="Experience">
          {experience.filter((e) => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '15px', color: '#191c1e' }}>{exp.title}</strong>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' — ' : ''}{exp.endDate}</span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#3525cd', textTransform: 'uppercase', margin: '4px 0 6px' }}>
                {exp.company}{exp.company && exp.location ? ' • ' : ''}{exp.location}
              </p>
              {exp.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3525cd', flexShrink: 0, marginTop: '6px' }} />
                  <span style={{ fontSize: '12.5px', color: '#444', lineHeight: 1.4 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </Row>
      )}

      {hasSkills && (
        <Row label="Skills">
          <div style={{ fontSize: '12px', color: '#444', lineHeight: 2 }}>
            {skills.technical?.length > 0    && <p style={{ margin: 0 }}><strong>Technical — </strong>{skills.technical.join(' · ')}</p>}
            {skills.languages?.length > 0    && <p style={{ margin: 0 }}><strong>Languages — </strong>{skills.languages.join(' · ')}</p>}
            {skills.soft?.length > 0         && <p style={{ margin: 0 }}><strong>Soft Skills — </strong>{skills.soft.join(' · ')}</p>}
            {skills.certifications?.length > 0 && <p style={{ margin: 0 }}><strong>Certifications — </strong>{skills.certifications.join(' · ')}</p>}
          </div>
        </Row>
      )}

      {education.filter((e) => e.institution).length > 0 && (
        <Row label="Education">
          {education.filter((e) => e.institution).map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '14px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong>
                <span style={{ fontSize: '10px', color: '#aaa' }}>{edu.graduationYear}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{edu.institution}</p>
            </div>
          ))}
        </Row>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════
   EXECUTIVE TEMPLATE — Elegant, high-level, single accent color
   ═══════════════════════════════════════════════════ */
const ExecutiveTemplate = memo(function ExecutiveTemplate({ data }) {
  const { personal = {}, experience = [], education = [], skills = {} } = data;

  return (
    <div style={{ fontFamily: "'Georgia', serif", color: '#0f172a', padding: '48px 56px', height: '100%', background: '#fff', lineHeight: 1.6 }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#475569' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.location && <span>• {personal.location}</span>}
          {personal.linkedin && <span>• {personal.linkedin}</span>}
        </div>
      </div>

      {personal.summary && (
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '14px', margin: 0, fontStyle: 'italic', color: '#334155' }}>{personal.summary}</p>
        </div>
      )}

      {/* Core Competencies (Skills) */}
      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '16px', color: '#0f172a' }}>
            Core Competencies
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[...(skills.technical || []), ...(skills.soft || [])].slice(0, 15).map((skill, i) => (
              <span key={i} style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 'bold' }}>
                {skill.split(':')[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.filter(e => e.title).length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '20px', color: '#0f172a' }}>
            Professional Experience
          </h2>
          {experience.filter(e => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{exp.title}</strong>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#334155', fontStyle: 'italic', marginBottom: '8px' }}>
                {exp.company}{exp.company && exp.location ? ' | ' : ''}{exp.location}
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ fontSize: '13.5px', marginBottom: '6px', color: '#334155', lineHeight: 1.5 }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.filter(e => e.institution).length > 0 && (
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '16px', color: '#0f172a' }}>
            Education
          </h2>
          {education.filter(e => e.institution).map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong>
                <div style={{ fontSize: '13px', color: '#475569' }}>{edu.institution}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                {edu.graduationYear}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════
   TECH TEMPLATE — Monospace accents, clean, code-like structure
   ═══════════════════════════════════════════════════ */
const TechTemplate = memo(function TechTemplate({ data }) {
  const { personal = {}, experience = [], education = [], skills = {} } = data;
  
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#cbd5e1', padding: '48px 52px', height: '100%', background: '#0f172a' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 8px 0' }}>
          <span style={{ color: '#38bdf8' }}>const</span> user = "{personal.fullName || 'Your Name'}";
        </h1>
        <div style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '12px', color: '#94a3b8', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {personal.email && <span>email: "{personal.email}"</span>}
          {personal.phone && <span>tel: "{personal.phone}"</span>}
          {personal.linkedin && <span>linkedin: "{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}"</span>}
          {personal.website && <span>web: "{personal.website}"</span>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div style={{ marginBottom: '28px', background: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
          <div style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '11px', color: '#38bdf8', marginBottom: '8px' }}>// SUMMARY</div>
          <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6, color: '#e2e8f0' }}>{personal.summary}</p>
        </div>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.languages?.length > 0) && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '12px', color: '#a78bfa', marginBottom: '12px' }}>&lt;Skills /&gt;</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[...(skills.technical || []), ...(skills.languages || [])].map((s, i) => (
              <span key={i} style={{ fontSize: '11.5px', background: '#1e293b', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontFamily: "'Fira Code', 'Courier New', monospace" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.filter(e => e.title).length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '12px', color: '#a78bfa', marginBottom: '16px' }}>&lt;Experience /&gt;</div>
          {experience.filter(e => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '24px', position: 'relative', paddingLeft: '16px' }}>
              <div style={{ position: 'absolute', left: 0, top: '6px', width: '2px', height: '100%', background: '#334155' }} />
              <div style={{ position: 'absolute', left: '-3px', top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{exp.title} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>@ {exp.company}</span></strong>
                <span style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '11px', color: '#64748b' }}>[{exp.startDate} - {exp.endDate}]</span>
              </div>
              
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#a78bfa', fontSize: '12px', fontFamily: "'Fira Code', 'Courier New', monospace" }}>&gt;</span>
                    <span style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Education */}
      {education.filter(e => e.institution).length > 0 && (
        <div>
          <div style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '12px', color: '#a78bfa', marginBottom: '12px' }}>&lt;Education /&gt;</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {education.filter(e => e.institution).map((edu, i) => (
              <div key={i} style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>{edu.degree}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0' }}>{edu.institution}</div>
                <div style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '11px', color: '#64748b' }}>{edu.graduationYear}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════
   COMPACT TEMPLATE — High density, 1-page optimized
   ═══════════════════════════════════════════════════ */
const CompactTemplate = memo(function CompactTemplate({ data }) {
  const { personal = {}, experience = [], education = [], skills = {} } = data;

  return (
    <div style={{ fontFamily: "'Arial', sans-serif", color: '#111', padding: '36px 44px', height: '100%', background: '#fff', fontSize: '11px', lineHeight: 1.35 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '11px' }}>
          {[personal.location, personal.phone, personal.email, personal.linkedin].filter(Boolean).map((item, i) => (
            <span key={i} style={{ color: '#444' }}>
              {i > 0 && <span style={{ margin: '0 6px', color: '#aaa' }}>|</span>}
              {item}
            </span>
          ))}
        </div>
      </div>

      {personal.summary && (
        <div style={{ marginBottom: '12px', textAlign: 'justify', fontSize: '11px' }}>
          {personal.summary}
        </div>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '6px' }}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'x: 8px, y: 2px', fontSize: '11px' }}>
            {skills.technical?.length > 0 && <div><strong>Technical:</strong> {skills.technical.join(', ')}</div>}
            {skills.languages?.length > 0 && <div><strong>Languages:</strong> {skills.languages.join(', ')}</div>}
            {skills.soft?.length > 0 && <div><strong>Soft:</strong> {skills.soft.join(', ')}</div>}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.filter(e => e.title).length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '8px' }}>Experience</div>
          {experience.filter(e => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <div>
                  <strong>{exp.title}</strong>, <em>{exp.company}</em> {exp.location && `- ${exp.location}`}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' - ' : ''}{exp.endDate}</div>
              </div>
              <ul style={{ margin: '4px 0 0', paddingLeft: '18px', listStyleType: 'disc', fontSize: '11px' }}>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', textAlign: 'justify' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.filter(e => e.institution).length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '8px' }}>Education</div>
          {education.filter(e => e.institution).map((edu, i) => (
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
               <div>
                 <strong>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</strong> - {edu.institution}
               </div>
               <div style={{ fontWeight: 'bold', color: '#555' }}>{edu.graduationYear}</div>
             </div>
          ))}
        </div>
      )}
      
      {/* Certifications */}
      {skills.certifications?.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '6px' }}>Certifications</div>
          <div style={{ fontSize: '11px' }}>{skills.certifications.join(', ')}</div>
        </div>
      )}
    </div>
  );
});
/* ═══════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════ */
const ResumePreview = memo(forwardRef(function ResumePreview({ resumeData, selectedTemplate, paperSize = 'a4' }, ref) {
  const tpl = selectedTemplate || 'modern';
  
  const width = paperSize === 'letter' ? '215.9mm' : '210mm';
  const minHeight = paperSize === 'letter' ? '279.4mm' : '297mm';

  return (
    <div
      ref={ref}
      id="resume-print-area"
      style={{
        width,
        minHeight,
        background: '#ffffff',
        borderRadius: '4px',
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        paddingBottom: '20px', // Extra padding at bottom so text doesn't touch the edge if it expands
      }}
      role="region"
      aria-label={`Resume preview — ${tpl} template`}
    >
      {tpl === 'classic'   && <ClassicTemplate data={resumeData} />}
      {tpl === 'modern'    && <ModernTemplate  data={resumeData} />}
      {tpl === 'minimal'   && <MinimalTemplate data={resumeData} />}
      {tpl === 'executive' && <ExecutiveTemplate data={resumeData} />}
      {tpl === 'tech'      && <TechTemplate data={resumeData} />}
      {tpl === 'compact'   && <CompactTemplate data={resumeData} />}
    </div>
  );
}), (prev, next) => {
  return prev.selectedTemplate === next.selectedTemplate && 
         prev.paperSize === next.paperSize && 
         JSON.stringify(prev.resumeData) === JSON.stringify(next.resumeData);
});

export default ResumePreview;
