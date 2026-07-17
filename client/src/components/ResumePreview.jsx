import { forwardRef, memo } from 'react';

/* ═══════════════════════════════════════════════════
   CLASSIC TEMPLATE — Traditional serif, centred header
   ═══════════════════════════════════════════════════ */
const ClassicTemplate = memo(function ClassicTemplate({ data }) {
  const { personal = {}, experience = [], projects = [], education = [], skills = {} } = data;

  return (
    <div style={{
      fontFamily: "Arial, Calibri, 'Helvetica Neue', sans-serif",
      color: '#000',
      padding: '28px 36px',
      background: '#fff',
      lineHeight: 1.35,
      fontSize: '11px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' , pageBreakInside: 'avoid' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '1px' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 6px', fontSize: '10px', color: '#111' }}>
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
          <p style={{ fontSize: '10.5px', margin: 0, textAlign: 'justify' }}>{personal.summary}</p>
        </Section>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.languages?.length > 0 || skills.soft?.length > 0) && (
        <Section title="TECHNICAL SKILLS">
          <div style={{ fontSize: '10.5px' }}>
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
            <div key={i} style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '12.5px' }}>
                  <strong>{exp.title}</strong>
                  {exp.company && <span> · {exp.company}</span>}
                  {exp.location && <span>, {exp.location}</span>}
                </div>
                <span style={{ fontSize: '10.5px', fontStyle: 'italic', color: '#333' }}>
                  {exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}
                </span>
              </div>
              <ul style={{ margin: '4px 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ fontSize: '10.5px', marginBottom: '2px', textAlign: 'justify' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}


      {/* Projects */}
      {projects.some((p) => p.title) && (
        <Section title="PROJECTS">
          {projects.filter((p) => p.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '12.5px' }}>
                  <strong>{proj.title}</strong>
                  {proj.role && <span> · {proj.role}</span>}
                  {proj.link && <span> · <a href={proj.link.startsWith('http') ? proj.link : 'https://'+proj.link} style={{color: '#000', textDecoration: 'none'}}>{proj.link.replace(/^https?:\/\//, '')}</a></span>}
                </div>
              </div>
              <ul style={{ margin: '4px 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                {proj.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ fontSize: '10.5px', marginBottom: '2px', textAlign: 'justify' }}>{b}</li>
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
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', fontSize: '12.5px' , pageBreakInside: 'avoid' }}>
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
    <div style={{ marginBottom: '10px' }}>
      <h2 style={{
        fontSize: '11px', fontWeight: 900, textTransform: 'uppercase',
        borderBottom: '1px solid #000', paddingBottom: '2px', margin: '0 0 5px 0',
      }}>{title}</h2>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MODERN TEMPLATE — Dark sidebar, two-column
   ═══════════════════════════════════════════════════ */
const ModernTemplate = memo(function ModernTemplate({ data }) {
  const { personal = {}, experience = [], projects = [], education = [], skills = {} } = data;

  return (
    <div style={{ display: 'table', width: '100%', height: '100%', fontFamily: "Arial, Calibri, 'Helvetica Neue', sans-serif", background: '#fff' }}>

      {/* Sidebar */}
      <div style={{ display: 'table-cell', width: '30%', background: '#1d00a5', color: '#fff', padding: '28px 18px', verticalAlign: 'top', height: '100%' }}>
        <div>
          {(personal.fullName || 'Your Name').split(' ').map((n, i) => <div key={i} style={{ fontSize: i === 0 ? '18px' : '16px', fontWeight: 900, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{n}</div>
          )}
          <div style={{ width: '32px', height: '3px', background: '#c3c0ff', margin: '14px 0' }} />
          {[personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).map((v, i) => (
            <p key={i} style={{ fontSize: '9.5px', opacity: 0.88, margin: '3px 0', wordBreak: 'break-all', lineHeight: 1.35 }}>{v}</p>
          ))}
        </div>

        {/* Skills sidebar */}
        {skills.technical?.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {[...(skills.technical || []), ...(skills.languages || [])].slice(0, 16).map((s) => (
                <span key={s} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '3px', padding: '3px 6px', fontSize: '8.5px', fontWeight: 500, lineHeight: 1.3 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {skills.soft?.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>Soft Skills</p>
            {skills.soft.slice(0, 7).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#c3c0ff', flexShrink: 0 }} />
                <span style={{ fontSize: '9.5px', opacity: 0.9, lineHeight: 1.3 }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {education.filter((e) => e.institution).length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>Education</p>
            {education.filter((e) => e.institution).map((edu, i) => (
              <div key={i} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                <p style={{ fontSize: '9px', opacity: 0.8, margin: '2px 0' }}>{edu.institution}</p>
                <p style={{ fontSize: '8.5px', opacity: 0.6, margin: 0 }}>{edu.graduationYear}</p>
              </div>
            ))}
          </div>
        )}

        {skills.certifications?.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>Certifications</p>
            {skills.certifications.map((c) => <p key={c} style={{ fontSize: '9px', opacity: 0.85, margin: '4px 0', lineHeight: 1.35 }}>• {c}</p>)}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ display: 'table-cell', padding: '28px 24px', verticalAlign: 'top' }}>
        {personal.summary && (
          <div>
            <MLabel>Profile</MLabel>
            <p style={{ fontSize: '10.5px', color: '#333', lineHeight: 1.55, margin: 0 }}>{personal.summary}</p>
          </div>
        )}

        {experience.filter((e) => e.title).length > 0 && (
          <div>
            <MLabel>Experience</MLabel>
            {experience.filter((e) => e.title).map((exp, i) => (
              <div key={i} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '12px', color: '#191c1e' }}>{exp.title}</strong>
                  <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' — ' : ''}{exp.endDate}</span>
                </div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#1d00a5', textTransform: 'uppercase', margin: '3px 0 6px' }}>
                  {exp.company}{exp.company && exp.location ? ' • ' : ''}{exp.location}
                </p>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: '9px', marginBottom: '5px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1d00a5', flexShrink: 0, marginTop: '7px' }} />
                    <span style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.55 }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {projects.filter((p) => p.title).length > 0 && (
          <div>
            <MLabel>Projects</MLabel>
            {projects.filter((p) => p.title).map((proj, i) => (
              <div key={i} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '12px', color: '#191c1e' }}>{proj.title}</strong>
                  {proj.link && <span style={{ fontSize: '9.5px', color: '#888' }}>{proj.link.replace(/^https?:\/\//, '')}</span>}
                </div>
                {proj.role && <p style={{ fontSize: '10px', fontWeight: 700, color: '#1d00a5', textTransform: 'uppercase', margin: '3px 0 6px' }}>{proj.role}</p>}
                {proj.bullets?.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: '9px', marginBottom: '5px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1d00a5', flexShrink: 0, marginTop: '7px' }} />
                    <span style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.55 }}>{b}</span>
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
  return <p style={{ fontSize: '8.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#aaa', marginBottom: '8px' }}>{children}</p>;
}

/* ═══════════════════════════════════════════════════
   MINIMAL TEMPLATE — Clean top-label sections, print-safe
   ═══════════════════════════════════════════════════ */
const MinimalTemplate = memo(function MinimalTemplate({ data }) {
  const { personal = {}, experience = [], projects = [], education = [], skills = {} } = data;
  const hasSkills = Object.values(skills).some((a) => a?.length > 0);

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#aaa', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '12px' }}>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: "Arial, Calibri, 'Helvetica Neue', sans-serif", color: '#191c1e', padding: '24px 32px', background: '#fff', fontSize: '10.5px', lineHeight: 1.35 }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #191c1e', paddingBottom: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1, margin: '0 0 5px 0' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px', fontSize: '9.5px', color: '#555' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {personal.summary && (
        <div style={{ marginBottom: '18px' }}>
          <SectionLabel>Profile</SectionLabel>
          <p style={{ fontSize: '10.5px', color: '#333', lineHeight: 1.55, margin: 0 }}>{personal.summary}</p>
        </div>
      )}

      {experience.filter((e) => e.title).length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <SectionLabel>Experience</SectionLabel>
          {experience.filter((e) => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '11px', color: '#191c1e' }}>{exp.title}</strong>
                <span style={{ fontSize: '9px', color: '#999' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}</span>
              </div>
              <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#3525cd', margin: '2px 0 4px' }}>
                {exp.company}{exp.company && exp.location ? ' · ' : ''}{exp.location}
              </p>
              {exp.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ color: '#3525cd', flexShrink: 0 }}>–</span>
                  <span style={{ fontSize: '11.5px', color: '#444', lineHeight: 1.45 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {projects.filter((p) => p.title).length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <SectionLabel>Projects</SectionLabel>
          {projects.filter((p) => p.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '11px', color: '#191c1e' }}>{proj.title}</strong>
                {proj.link && <span style={{ fontSize: '10px', color: '#aaa' }}>{proj.link.replace(/^https?:\/\//, '')}</span>}
              </div>
              {proj.role && <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#3525cd', margin: '2px 0 4px' }}>{proj.role}</p>}
              {proj.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ color: '#3525cd', flexShrink: 0 }}>–</span>
                  <span style={{ fontSize: '11.5px', color: '#444', lineHeight: 1.45 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {hasSkills && (
        <div style={{ marginBottom: '18px', pageBreakInside: 'avoid' }}>
          <SectionLabel>Skills</SectionLabel>
          <div style={{ fontSize: '11.5px', color: '#444', lineHeight: 1.8 }}>
            {skills.technical?.length > 0    && <div><strong>Technical:</strong> {skills.technical.join(' · ')}</div>}
            {skills.languages?.length > 0    && <div><strong>Languages:</strong> {skills.languages.join(' · ')}</div>}
            {skills.soft?.length > 0         && <div><strong>Soft Skills:</strong> {skills.soft.join(' · ')}</div>}
            {skills.certifications?.length > 0 && <div><strong>Certifications:</strong> {skills.certifications.join(' · ')}</div>}
          </div>
        </div>
      )}

      {education.filter((e) => e.institution).length > 0 && (
        <div style={{ pageBreakInside: 'avoid' }}>
          <SectionLabel>Education</SectionLabel>
          {education.filter((e) => e.institution).map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <div>
                <strong style={{ fontSize: '12px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong>
                <span style={{ fontSize: '11px', color: '#666' }}> · {edu.institution}</span>
              </div>
              <span style={{ fontSize: '10px', color: '#aaa', flexShrink: 0 }}>{edu.graduationYear}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════
   EXECUTIVE TEMPLATE — Elegant, high-level, single accent color
   ═══════════════════════════════════════════════════ */
const ExecutiveTemplate = memo(function ExecutiveTemplate({ data }) {
  const { personal = {}, experience = [], projects = [], education = [], skills = {} } = data;

  return (
    <div style={{ fontFamily: "Arial, Calibri, 'Helvetica Neue', sans-serif", color: '#0f172a', padding: '28px 36px', background: '#fff', lineHeight: 1.35 }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '10.5px', color: '#475569' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.location && <span>• {personal.location}</span>}
          {personal.linkedin && <span>• {personal.linkedin}</span>}
        </div>
      </div>

      {personal.summary && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '10.5px', margin: 0, fontStyle: 'italic', color: '#334155' }}>{personal.summary}</p>
        </div>
      )}

      {/* Core Competencies (Skills) */}
      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14.5px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', color: '#0f172a' }}>
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
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14.5px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '14px', color: '#0f172a' }}>
            Professional Experience
          </h2>
          {experience.filter(e => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '10px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{exp.title}</strong>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#334155', fontStyle: 'italic', marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                {exp.company}{exp.company && exp.location ? ' | ' : ''}{exp.location}
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ fontSize: '10.5px', marginBottom: '4px', color: '#334155', lineHeight: 1.4 }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.filter(e => e.title).length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11.5px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '10px', color: '#0f172a' }}>
            Projects
          </h2>
          {projects.filter(e => e.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{proj.title}</strong>
                {proj.link && <span style={{ fontSize: '9.5px', color: '#64748b' }}>{proj.link.replace(/^https?:\/\//, '')}</span>}
              </div>
              {proj.role && <div style={{ fontSize: '10px', color: '#334155', fontStyle: 'italic', marginBottom: '4px' }}>{proj.role}</div>}
              <ul style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
                {proj.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ fontSize: '10.5px', marginBottom: '3px', color: '#334155', lineHeight: 1.4 }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.filter(e => e.institution).length > 0 && (
        <div>
          <h2 style={{ fontSize: '14.5px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', color: '#0f172a' }}>
            Education
          </h2>
          {education.filter(e => e.institution).map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' , pageBreakInside: 'avoid' }}>
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
   IMPACT TEMPLATE — Trending bold accent, clean white, modern
   ═══════════════════════════════════════════════════ */
const TechTemplate = memo(function TechTemplate({ data }) {
  const { personal = {}, experience = [], projects = [], education = [], skills = {} } = data;

  const accent = '#6C47FF';
  const light = '#F4F1FF';

  const SectionHead = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', pageBreakAfter: 'avoid' }}>
      <div style={{ width: '4px', height: '18px', background: accent, borderRadius: '2px', flexShrink: 0 }} />
      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#1a1a2e' }}>{children}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "Arial, Calibri, 'Helvetica Neue', sans-serif", color: '#1a1a2e', background: '#ffffff', padding: '24px 32px', fontSize: '10.5px', lineHeight: 1.35 }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: `3px solid ${accent}` }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 3px 0', letterSpacing: '-0.5px', color: '#1a1a2e' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', fontSize: '9.5px', color: '#666' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span style={{ color: accent, fontWeight: 600 }}>{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
          {personal.website && <span style={{ color: accent, fontWeight: 600 }}>{personal.website.replace(/^https?:\/\//, '')}</span>}
        </div>
      </div>

      {/* Two-column layout — table-based for print compatibility */}
      <div style={{ display: 'table', width: '100%', borderSpacing: '28px 0', tableLayout: 'fixed' }}>

        {/* Left column — Skills, Education */}
        <div style={{ display: 'table-cell', width: '170px', verticalAlign: 'top' }}>

          {(skills.technical?.length > 0 || skills.languages?.length > 0) && (
            <div style={{ marginBottom: '20px' }}>
              <SectionHead>Skills</SectionHead>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {[...(skills.technical || []), ...(skills.languages || [])].map((s, i) => (
                  <span key={i} style={{ fontSize: '8.5px', background: light, color: accent, fontWeight: 600, padding: '2px 6px', borderRadius: '20px' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {skills.soft?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <SectionHead>Soft Skills</SectionHead>
              {skills.soft.map((s, i) => (
                <div key={i} style={{ fontSize: '9.5px', color: '#444', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          )}

          {education.filter(e => e.institution).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <SectionHead>Education</SectionHead>
              {education.filter(e => e.institution).map((edu, i) => (
                <div key={i} style={{ marginBottom: '10px', pageBreakInside: 'avoid' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#1a1a2e' }}>{edu.degree}</div>
                  {edu.field && <div style={{ fontSize: '9px', color: '#555' }}>{edu.field}</div>}
                  <div style={{ fontSize: '9px', color: '#777' }}>{edu.institution}</div>
                  <div style={{ fontSize: '8.5px', color: accent, fontWeight: 600 }}>{edu.graduationYear}</div>
                </div>
              ))}
            </div>
          )}

          {skills.certifications?.length > 0 && (
            <div>
              <SectionHead>Certifications</SectionHead>
              {skills.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: '9px', color: '#444', marginBottom: '4px', lineHeight: 1.35 }}>{c}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right column — Summary, Experience, Projects */}
        <div style={{ display: 'table-cell', verticalAlign: 'top' }}>

          {personal.summary && (
            <div style={{ marginBottom: '20px' }}>
              <SectionHead>Profile</SectionHead>
              <p style={{ fontSize: '10px', color: '#444', lineHeight: 1.55, margin: 0 }}>{personal.summary}</p>
            </div>
          )}

          {experience.filter(e => e.title).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <SectionHead>Experience</SectionHead>
              {experience.filter(e => e.title).map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '11px', color: '#1a1a2e' }}>{exp.title}</strong>
                    <span style={{ fontSize: '8.5px', color: '#999' }}>{exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}</span>
                  </div>
                  <p style={{ fontSize: '9.5px', fontWeight: 700, color: accent, margin: '2px 0 4px' }}>
                    {exp.company}{exp.company && exp.location ? ' · ' : ''}{exp.location}
                  </p>
                  {exp.bullets?.filter(Boolean).map((b, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, flexShrink: 0, marginTop: '5px' }} />
                      <span style={{ fontSize: '11.5px', color: '#333', lineHeight: 1.45 }}>{b}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {projects.filter(p => p.title).length > 0 && (
            <div>
              <SectionHead>Projects</SectionHead>
              {projects.filter(p => p.title).map((proj, i) => (
                <div key={i} style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '11px', color: '#1a1a2e' }}>{proj.title}</strong>
                    {proj.link && <span style={{ fontSize: '8.5px', color: accent }}>{proj.link.replace(/^https?:\/\//, '')}</span>}
                  </div>
                  {proj.role && <p style={{ fontSize: '9.5px', fontWeight: 700, color: accent, margin: '2px 0 4px' }}>{proj.role}</p>}
                  {proj.bullets?.filter(Boolean).map((b, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, flexShrink: 0, marginTop: '5px' }} />
                      <span style={{ fontSize: '11.5px', color: '#333', lineHeight: 1.45 }}>{b}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════
   COMPACT TEMPLATE — High density, 1-page optimized
   ═══════════════════════════════════════════════════ */
const CompactTemplate = memo(function CompactTemplate({ data }) {
  const { personal = {}, experience = [], projects = [], education = [], skills = {} } = data;

  return (
    <div style={{ fontFamily: "'Arial', sans-serif", color: '#111', padding: '36px 44px', background: '#fff', fontSize: '11px', lineHeight: 1.35 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' , pageBreakInside: 'avoid' }}>
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
        <div style={{ marginBottom: '12px' , pageBreakInside: 'avoid' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '6px' }}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px', fontSize: '11px' }}>
            {skills.technical?.length > 0 && <div><strong>Technical:</strong> {skills.technical.join(', ')}</div>}
            {skills.languages?.length > 0 && <div><strong>Languages:</strong> {skills.languages.join(', ')}</div>}
            {skills.soft?.length > 0 && <div><strong>Soft:</strong> {skills.soft.join(', ')}</div>}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.filter(e => e.title).length > 0 && (
        <div style={{ marginBottom: '12px' , pageBreakInside: 'avoid' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '8px' , pageBreakInside: 'avoid' }}>Experience</div>
          {experience.filter(e => e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: '8px' , pageBreakInside: 'avoid' }}>
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

      {/* Projects */}
      {projects.filter(e => e.title).length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '5px' }}>Projects</div>
          {projects.filter(e => e.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: '5px', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <div>
                  <strong>{proj.title}</strong>{proj.role && <em>, {proj.role}</em>}
                </div>
                {proj.link && <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#555' }}>{proj.link.replace(/^https?:\/\//, '')}</div>}
              </div>
              <ul style={{ margin: '3px 0 0', paddingLeft: '16px', listStyleType: 'disc', fontSize: '10.5px' }}>
                {proj.bullets?.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ marginBottom: '1px', textAlign: 'justify' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.filter(e => e.institution).length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '8px' , pageBreakInside: 'avoid' }}>Education</div>
          {education.filter(e => e.institution).map((edu, i) => (
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' , pageBreakInside: 'avoid' }}>
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
        background: tpl === 'modern' ? 'linear-gradient(to right, #1d00a5 0%, #1d00a5 30%, #ffffff 30%, #ffffff 100%)' : '#ffffff',
        borderRadius: '4px',
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
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
