import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  root: {
    '--bg': '#f5f1e8',
    '--text-main': '#111111',
    '--text-muted': '#555555',
    '--border': '#111111',
    '--green': '#00ff00',
    '--red': '#ff0000',
    '--shadow-offset': '4px',
  },
  body: {
    backgroundColor: '#f5f1e8',
    backgroundImage: `linear-gradient(#111111 1px, transparent 1px), linear-gradient(90deg, #111111 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    backgroundPosition: '-1px -1px',
  },
  bodyOverlay: {
    content: '',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: '#f5f1e8',
    opacity: 0.95,
    zIndex: -1,
  },
  monoLabel: {
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#555555',
    marginBottom: '0.5rem',
    display: 'block',
  },
  sysBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.1rem 0.4rem',
    border: '1px solid #111111',
    textTransform: 'uppercase',
  },
  badgeGreen: {
    background: '#00ff00',
    color: '#111111',
  },
  badgeRed: {
    background: '#ff0000',
    color: '#fff',
  },
  card: {
    border: '2px solid #111111',
    background: '#f5f1e8',
    padding: '2rem',
    position: 'relative',
  },
  cardAfter: {
    content: '',
    position: 'absolute',
    top: '4px',
    left: '4px',
    width: '100%',
    height: '100%',
    border: '1px solid #111111',
    background: 'transparent',
    zIndex: -1,
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontWeight: 700,
    textTransform: 'uppercase',
    textDecoration: 'none',
    padding: '1rem 2rem',
    border: '2px solid #111111',
    background: '#f5f1e8',
    color: '#111111',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  btnPrimary: {
    background: '#111111',
    color: '#f5f1e8',
  },
  heroVisual: {
    position: 'relative',
    height: '400px',
    border: '2px solid #111111',
    background: `repeating-linear-gradient(0deg, transparent, transparent 19px, #111111 19px, #111111 20px)`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: '#00ff00',
    boxShadow: '0 0 15px #00ff00',
    animation: 'scan 4s linear infinite',
  },
  visualData: {
    background: '#f5f1e8',
    padding: '1rem',
    border: '2px solid #111111',
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '0.875rem',
    zIndex: 1,
    boxShadow: '8px 8px 0 #111111',
  },
  integrationWrapper: {
    background: '#111111',
    color: '#f5f1e8',
    padding: '3rem',
    position: 'relative',
    boxShadow: '8px 8px 0 rgba(0,0,0,0.1)',
  },
  codeBlock: {
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '0.9rem',
    color: '#00ff00',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  roiWrapper: {
    background: '#fff',
    border: '2px solid #111111',
    padding: '3rem',
    boxShadow: '8px 8px 0 #111111',
    maxWidth: '800px',
    margin: '0 auto',
  },
  ledgerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderBottom: '1px dotted #555555',
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
  },
  ledgerRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '2rem 0 1rem',
    borderBottom: '2px solid #111111',
    borderTop: '2px solid #111111',
    marginTop: '1rem',
    fontWeight: 700,
    fontSize: '1.25rem',
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
  },
  step: {
    background: '#f5f1e8',
    padding: '2rem',
    border: '2px solid #111111',
    position: 'relative',
    zIndex: 1,
    boxShadow: '4px 4px 0 #111111',
  },
  stepNum: {
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '1.5rem',
    fontWeight: 700,
    background: '#111111',
    color: '#f5f1e8',
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    marginBottom: '1.5rem',
  },
  stepViz: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#fff',
    border: '1px solid #111111',
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    textAlign: 'center',
  },
  tierPrice: {
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '3rem',
    fontWeight: 700,
    margin: '1rem 0',
  },
  tierMetric: {
    background: '#e0dcd2',
    padding: '0.75rem',
    fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    textAlign: 'center',
    border: '1px solid #111111',
  },
};

const Header = () => {
  const [statusVisible, setStatusVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusVisible(v => !v);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      padding: '1.5rem 0',
      borderBottom: '2px solid #111111',
      background: '#f5f1e8',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Space Mono', 'Courier New', Courier, monospace", fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.05em' }}>
          VerifyUS //
        </div>
        <div style={{ fontFamily: "'Space Mono', 'Courier New', Courier, monospace", fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#00ff00',
            border: '1px solid #111111',
            display: 'inline-block',
            opacity: statusVisible ? 1 : 0.2,
            transition: 'opacity 0.3s',
          }}></span>
          SYSTEM_STATUS: ONLINE
        </div>
      </div>
    </header>
  );
};

const Btn = ({ children, primary, onClick, style }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...customStyles.btn,
        ...(primary ? customStyles.btnPrimary : {}),
        transform: hovered ? 'translate(2px, 2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const ThreatCard = ({ label, title, badge, description, statLabel, statValue }) => (
  <div style={{ ...customStyles.card, display: 'flex', flexDirection: 'column' }}>
    <div style={{ ...customStyles.cardAfter, position: 'absolute', top: '4px', left: '4px', width: '100%', height: '100%', border: '1px solid #111111', background: 'transparent', zIndex: -1, pointerEvents: 'none' }}></div>
    <span style={customStyles.monoLabel}>{label}</span>
    <h3 style={{ fontFamily: "'Space Mono', 'Courier New', Courier, monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {title}
      <span style={{ ...customStyles.sysBadge, ...customStyles.badgeRed }}>{badge}</span>
    </h3>
    <p style={{ fontSize: '0.875rem', color: '#555555', marginBottom: '1.5rem', maxWidth: '60ch' }}>{description}</p>
    <div style={{ borderTop: '1px dashed #111111', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', 'Courier New', Courier, monospace", fontSize: '0.75rem' }}>
      <span>{statLabel}</span>
      <span>{statValue}</span>
    </div>
  </div>
);

const PricingTier = ({ label, price, description, features, metric, highlighted }) => (
  <div style={{
    ...customStyles.card,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: highlighted ? '#e0dcd2' : '#f5f1e8',
    transform: highlighted ? 'translateY(-10px)' : 'none',
  }}>
    <div style={{ position: 'absolute', top: '4px', left: '4px', width: '100%', height: '100%', border: '1px solid #111111', background: 'transparent', zIndex: -1, pointerEvents: 'none' }}></div>
    <div style={{ borderBottom: '2px solid #111111', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
      <span style={{ ...customStyles.monoLabel, color: highlighted ? '#111111' : '#555555' }}>{label}</span>
      <div style={customStyles.tierPrice}>{price}<span style={{ fontSize: '1rem', color: '#555555', verticalAlign: 'middle' }}>/APP</span></div>
      <p style={{ fontSize: '0.875rem', color: '#555555', maxWidth: '60ch' }}>{description}</p>
    </div>
    <ul style={{ listStyle: 'none', marginBottom: '2rem', flexGrow: 1, padding: 0 }}>
      {features.map((f, i) => (
        <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 'bold', color: '#111111' }}>{'>'}</span>
          {f}
        </li>
      ))}
    </ul>
    <div style={{
      ...customStyles.tierMetric,
      background: highlighted ? '#111111' : '#e0dcd2',
      color: highlighted ? '#00ff00' : '#111111',
    }}>
      {metric}
    </div>
  </div>
);

const HomePage = () => {
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    let start = null;
    let animFrame;
    const duration = 4000;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % duration;
      const pct = (elapsed / duration) * 120 - 10;
      setScanPos(pct);
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 2rem 2rem', borderBottom: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(300px, 60%, 700px) 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.125rem', background: '#111111', color: '#f5f1e8', display: 'inline-block', padding: '0.25rem 0.5rem', marginBottom: '2rem' }}>
              TARGET: EMPLOYER INFRASTRUCTURE
            </div>
            <h1 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Stop Bot Applications Dead.
            </h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '60ch' }}>
              Fraudulent hires cost enterprise orgs an average of $50K+. Deploy zero-knowledge verification and military-grade infrastructure to filter ATS pipelines before manual review begins.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Btn primary>Deploy_System</Btn>
              <Btn>View_Docs</Btn>
            </div>
          </div>
          <div style={customStyles.heroVisual}>
            <div style={{ ...customStyles.scannerLine, top: `${scanPos}%` }}></div>
            <div style={customStyles.visualData}>
              &gt; INCOMING_PAYLOAD: 1042_APPS<br />
              &gt; SCANNING_SIGNATURES...<br />
              &gt; BLOCKED: 841 [BOT_NET]<br />
              &gt; VERIFIED: 201 [HUMAN]<br />
              <span style={{ ...customStyles.sysBadge, ...customStyles.badgeGreen, marginTop: '10px', display: 'inline-block' }}>PIPELINE_SECURE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Module 01 - Threat Vectors */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', borderBottom: '1px solid #111111' }}>
        <div style={{ marginBottom: '4rem' }}>
          <span style={customStyles.monoLabel}>Module 01</span>
          <h2 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem', display: 'inline-block', borderBottom: '4px solid #111111', paddingBottom: '0.5rem' }}>
            Threat Vectors Filtered
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <ThreatCard
            label="VECTOR_01"
            title="Bot Farms"
            badge="BLOCKED"
            description="Automated scripts submitting thousands of LLM-generated resumes to saturate ATS pipelines and exhaust recruiting resources."
            statLabel="DETECTION_RATE"
            statValue="99.9%"
          />
          <ThreatCard
            label="VECTOR_02"
            title="VPN / Proxy Abuse"
            badge="BLOCKED"
            description="Applicants misrepresenting geographic location to bypass remote-work restrictions or tax-compliance boundaries."
            statLabel="NODE_RESOLUTION"
            statValue="ACTIVE"
          />
          <ThreatCard
            label="VECTOR_03"
            title="Identity Spoofing"
            badge="BLOCKED"
            description="Sybil attacks using stolen or synthetically generated credentials to pass initial background or reference checks."
            statLabel="LIVENESS_CHECK"
            statValue="REQUIRED"
          />
        </div>
      </section>

      {/* Module 02 - Integration */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', borderBottom: '1px solid #111111' }}>
        <div style={{ marginBottom: '4rem' }}>
          <span style={customStyles.monoLabel}>Module 02</span>
          <h2 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem', display: 'inline-block', borderBottom: '4px solid #111111', paddingBottom: '0.5rem' }}>
            Integration Protocol
          </h2>
          <p style={{ marginTop: '1rem', maxWidth: '60ch' }}>
            One webhook connects VerifyUS to Greenhouse, Lever, or Workday. We intercept the application payload, route it through our verification engine, and append the status.
          </p>
        </div>
        <div style={customStyles.integrationWrapper}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #555555', paddingBottom: '1rem', marginBottom: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '0.875rem', color: '#555555' }}>
            <span>bash - root@verifyus-node-1</span>
            <span>10.0.4.2</span>
          </div>
          <div style={customStyles.codeBlock}>
            <span style={{ color: '#888' }}># 1. Generate API Keys in VerifyUS Dashboard{'\n'}</span>
            <span style={{ color: '#fff' }}>export</span>{' '}V_API_KEY="vk_live_8f9a2b4c6d..."{'\n\n'}
            <span style={{ color: '#888' }}># 2. Configure ATS Webhook Endpoint{'\n'}</span>
            <span style={{ color: '#fff' }}>curl</span>{' '}-X POST https://api.verifyus.com/v1/webhooks \{'\n'}
            {'  '}-H <span style={{ color: '#fff' }}>"Authorization: Bearer $V_API_KEY"</span> \{'\n'}
            {'  '}-d {'\'{\n'}
            {'    '}"ats_provider": "greenhouse",{'\n'}
            {'    '}"target_url": "https://boards-api.greenhouse.io/v1/boards/YOUR_BOARD/jobs"{'\n'}
            {'  }{\'}\'{'\n\n'}
            <span style={{ color: '#888' }}>&gt; SYSTEM_RESPONSE: WEBHOOK_ESTABLISHED [200 OK]{'\n'}</span>
            <span style={{ color: '#888' }}>&gt; LISTENING_FOR_EVENTS...</span>
          </div>
        </div>
      </section>

      {/* Module 03 - Pricing */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', borderBottom: '1px solid #111111' }}>
        <div style={{ marginBottom: '4rem' }}>
          <span style={customStyles.monoLabel}>Module 03</span>
          <h2 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem', display: 'inline-block', borderBottom: '4px solid #111111', paddingBottom: '0.5rem' }}>
            Execution Tiers
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          <PricingTier
            label="L1 :: PRE-FILTER"
            price="$1"
            description="Deflect basic automation."
            features={['IP & Proxy Analysis', 'Device Fingerprinting', 'Basic Rate Limiting']}
            metric="YIELD: BLOCKS 40-60% BOTS"
          />
          <PricingTier
            label="L2 :: STANDARD [REC]"
            price="$3"
            description="Comprehensive verification."
            features={['Everything in L1', 'Government ID Verification', 'Liveness Detection (Biometric)', 'Work Authorization Ping']}
            metric="YIELD: BLOCKS 95%+ BOTS"
            highlighted
          />
          <PricingTier
            label="L3 :: DEEP SCAN"
            price="$4"
            description="For cleared/executive roles."
            features={['Everything in L2', 'LLM Social Proof Scraping', 'Employment History Cross-check', 'Dedicated Slack Channel']}
            metric="YIELD: BLOCKS 99.9% BOTS"
          />
        </div>
      </section>

      {/* Module 04 - Operational Flow */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', borderBottom: '1px solid #111111' }}>
        <div style={{ marginBottom: '4rem' }}>
          <span style={customStyles.monoLabel}>Module 04</span>
          <h2 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem', display: 'inline-block', borderBottom: '4px solid #111111', paddingBottom: '0.5rem' }}>
            Operational Flow
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', left: '50px', right: '50px', height: '2px', background: '#111111', zIndex: 0 }}></div>
          <div style={customStyles.step}>
            <span style={customStyles.stepNum}>[01]</span>
            <h3 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem', marginBottom: '1rem' }}>Integrate</h3>
            <p style={{ fontSize: '1rem', maxWidth: '60ch' }}>Connect VerifyUS to your ATS via a single webhook. No engineering sprints required. Live in 15 minutes.</p>
            <div style={customStyles.stepViz}>STATUS: LISTENING</div>
          </div>
          <div style={customStyles.step}>
            <span style={customStyles.stepNum}>[02]</span>
            <h3 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem', marginBottom: '1rem' }}>Filter</h3>
            <p style={{ fontSize: '1rem', maxWidth: '60ch' }}>Applicants hit a secure, frictionless verification gate before their resume enters your queue.</p>
            <div style={{ ...customStyles.stepViz, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ ...customStyles.sysBadge, ...customStyles.badgeGreen }}>VERIFIED</span>
              <span style={{ ...customStyles.sysBadge, ...customStyles.badgeRed }}>REJECTED</span>
            </div>
          </div>
          <div style={customStyles.step}>
            <span style={customStyles.stepNum}>[03]</span>
            <h3 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem', marginBottom: '1rem' }}>Review</h3>
            <p style={{ fontSize: '1rem', maxWidth: '60ch' }}>Your recruiting team logs into the ATS and only sees 100% verified human candidates.</p>
            <div style={{ ...customStyles.stepViz, background: '#111111', color: '#f5f1e8' }}>T_SAVED: 10HRS/ROLE</div>
          </div>
        </div>
      </section>

      {/* Module 05 - Impact Ledger */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', borderBottom: '1px solid #111111' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={customStyles.monoLabel}>Module 05</span>
          <h2 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem', display: 'inline-block', borderBottom: '4px solid #111111', paddingBottom: '0.5rem' }}>
            Impact Ledger
          </h2>
        </div>
        <div style={customStyles.roiWrapper}>
          {[
            { label: 'TOTAL_APPLICATIONS_RECEIVED', value: '200', style: {} },
            { label: 'BOTS_DETECTED_AND_BLOCKED', value: '-80', style: { color: '#ff0000' } },
            { label: 'HUMANS_TO_REVIEW', value: '120', style: {} },
            { label: 'MANUAL_SCREENING_COST (200 @ $12/EACH)', value: '$2,400.00', style: { color: '#ff0000' } },
            { label: 'VERIFYUS_COST (200 @ $3/EACH)', value: '$600.00', style: {} },
          ].map((row, i) => (
            <div key={i} style={customStyles.ledgerRow}>
              <span style={{ color: '#555555' }}>{row.label}</span>
              <span style={row.style}>{row.value}</span>
            </div>
          ))}
          <div style={customStyles.ledgerRowLast}>
            <span style={{ color: '#555555' }}>NET_CAPITAL_SAVED_PER_ROLE</span>
            <span style={{ color: '#00ff00', background: '#000', padding: '0 0.5rem' }}>$1,800.00</span>
          </div>
          <div style={{ ...customStyles.ledgerRow, borderTop: 'none', paddingTop: 0 }}>
            <span style={{ color: '#555555' }}>TIME_RECOVERED</span>
            <span style={{ color: '#00ff00', background: '#000', padding: '0 0.5rem' }}>16.0 HRS</span>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 500, lineHeight: 1.3, maxWidth: '800px', margin: '0 auto 2rem', fontStyle: 'italic', color: '#111111' }}>
          "We deployed VerifyUS as a pilot on one senior engineering role. It caught a bot net submitting 400+ fake resumes over a weekend. We rolled it out globally the next day."
        </p>
        <div style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
          VP Engineering, Enticeable<br />
          <span style={{ color: '#00ff00', fontWeight: 'bold', background: '#000', padding: '2px 6px', marginTop: '10px', display: 'inline-block' }}>
            METRIC: 63% BOT DETECTION
          </span>
        </div>
      </section>
    </main>
  );
};

const Footer = () => (
  <footer style={{ borderTop: '4px solid #111111', padding: '6rem 0', background: '#f5f1e8', textAlign: 'center' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      <h2 style={{ fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem', marginBottom: '2rem' }}>
        Initialize Secure Pipeline.
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
        <Btn primary>Start_Pilot</Btn>
        <Btn>Technical_Docs</Btn>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', borderTop: '1px solid #111111', paddingTop: '2rem', textTransform: 'uppercase', flexWrap: 'wrap', gap: '1rem' }}>
        <div>© 2024 VERIFYUS_SYSTEMS_LLC.</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="#" style={{ color: '#111111', textDecoration: 'none' }}>Privacy_Policy</a>
          <span> // </span>
          <a href="#" style={{ color: '#111111', textDecoration: 'none' }}>Terms_Of_Service</a>
          <span> // </span>
          <a href="#" style={{ color: '#111111', textDecoration: 'none' }}>System_Status</a>
        </div>
      </div>
    </div>
  </footer>
);

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background-color: #f5f1e8;
        color: #111111;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
        background-image: linear-gradient(#111111 1px, transparent 1px), linear-gradient(90deg, #111111 1px, transparent 1px);
        background-size: 40px 40px;
        background-position: -1px -1px;
        background-blend-mode: overlay;
        position: relative;
      }
      body::before {
        content: '';
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: #f5f1e8;
        opacity: 0.95;
        z-index: -1;
      }
      @media (max-width: 768px) {
        .hero-grid { grid-template-columns: 1fr !important; }
        .hero-visual-wrap { display: none !important; }
        .steps-grid { grid-template-columns: 1fr !important; }
        .steps-connector { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div style={{ backgroundColor: '#f5f1e8', minHeight: '100vh' }}>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;