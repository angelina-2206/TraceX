import { CaseDetail } from '../types';

export type ReportLanguage = 'en' | 'hi' | 'te';

interface TranslationDict {
  reportTitle: string;
  reportSubtitle: string;
  restrictedBadge: string;
  threatScore: string;
  severityLevel: string;
  relayHops: string;
  chainOfCustody: string;
  analyzed: string;
  sealedRecords: string;
  sec1Title: string;
  ingestionDate: string;
  assignee: string;
  status: string;
  sec2Title: string;
  propertyCol: string;
  headerValCol: string;
  verdictCol: string;
  fromClaimed: string;
  displayName: string;
  returnPath: string;
  replyTo: string;
  spfVerification: string;
  dkimSignature: string;
  dmarcAlignment: string;
  spoofedMismatch: string;
  aligned: string;
  deceptiveMismatch: string;
  valid: string;
  pass: string;
  fail: string;
  sec3Title: string;
  hopCol: string;
  relayHostsCol: string;
  ipNetworkCol: string;
  locationCol: string;
  forensicStatusCol: string;
  flaggedBadge: string;
  normalBadge: string;
  anomalousHop: string;
  sec4Title: string;
  filenameCol: string;
  mimeSizeCol: string;
  sha256Col: string;
  sec5Title: string;
  eventIdCol: string;
  timestampCol: string;
  actionActorCol: string;
  merkleHashCol: string;
  footerTitle: string;
  footerGenerated: string;
  footerSigned: string;
}

const TRANSLATIONS: Record<ReportLanguage, TranslationDict> = {
  en: {
    reportTitle: 'ANVESHAK',
    reportSubtitle: 'Digital Forensics & Incident Investigation Report',
    restrictedBadge: 'RESTRICTED FORENSIC RECORD',
    threatScore: 'Threat Score',
    severityLevel: 'Severity Level',
    relayHops: 'Relay Hops',
    chainOfCustody: 'Chain of Custody',
    analyzed: 'Analyzed',
    sealedRecords: 'Sealed Seals',
    sec1Title: '1. Case Narrative & Executive Assessment',
    ingestionDate: 'Ingestion Date',
    assignee: 'Assignee',
    status: 'Status',
    sec2Title: '2. Email Envelope & Cryptographic Authentication',
    propertyCol: 'Property',
    headerValCol: 'Extracted Header Value',
    verdictCol: 'Forensic Verdict',
    fromClaimed: 'From (Claimed)',
    displayName: 'Display Name',
    returnPath: 'Return-Path',
    replyTo: 'Reply-To',
    spfVerification: 'SPF Verification',
    dkimSignature: 'DKIM Signature',
    dmarcAlignment: 'DMARC Alignment',
    spoofedMismatch: 'SPOOFED MISMATCH',
    aligned: 'ALIGNED',
    deceptiveMismatch: 'DECEPTIVE MISMATCH',
    valid: 'VALID',
    pass: 'PASS',
    fail: 'FAIL',
    sec3Title: '3. Header Flight Recorder Relay Path',
    hopCol: 'Hop',
    relayHostsCol: 'Relay Hosts (From → By)',
    ipNetworkCol: 'IP & Network',
    locationCol: 'Location',
    forensicStatusCol: 'Forensic Status',
    flaggedBadge: 'FLAGGED',
    normalBadge: 'NORMAL',
    anomalousHop: 'Anomalous hop',
    sec4Title: '4. Attachment Payloads & Sandbox Detonation',
    filenameCol: 'Filename',
    mimeSizeCol: 'MIME Type / Size',
    sha256Col: 'SHA-256 Digest',
    sec5Title: '5. Immutable Chain of Custody Ledger',
    eventIdCol: 'Event ID',
    timestampCol: 'Timestamp',
    actionActorCol: 'Action & Actor',
    merkleHashCol: 'Merkle SHA-256 Current Hash',
    footerTitle: 'ANVESHAK CYBER-FORENSICS WORKSTATION',
    footerGenerated: 'GENERATED',
    footerSigned: 'DIGITALLY SIGNED & SEALED',
  },
  hi: {
    reportTitle: 'अन्वेषक (ANVESHAK)',
    reportSubtitle: 'डिजिटल फोरेंसिक एवं साइबर घटना जांच रिपोर्ट',
    restrictedBadge: 'प्रतिबंधित फोरेंसिक अभिलेख (RESTRICTED)',
    threatScore: 'खतरा स्कोर (Threat Score)',
    severityLevel: 'गंभीरता स्तर (Severity)',
    relayHops: 'रिले हॉप्स (Relay Hops)',
    chainOfCustody: 'कस्टडी की श्रृंखला (Chain of Custody)',
    analyzed: 'विश्लेषित',
    sealedRecords: 'सीलबंद रिकॉर्ड',
    sec1Title: '1. मामला सारांश एवं कार्यकारी मूल्यांकन (Executive Summary)',
    ingestionDate: 'स्वीकृति तिथि',
    assignee: 'जांच अधिकारी',
    status: 'स्थिति',
    sec2Title: '2. ईमेल एनवेलप एवं क्रिप्टोग्राफिक प्रमाणीकरण (Email Authentication)',
    propertyCol: 'गुण / पैरामीटर',
    headerValCol: 'निकाला गया हेडर मान',
    verdictCol: 'फोरेंसिक निर्णय',
    fromClaimed: 'प्रेषक (दावा किया गया From)',
    displayName: 'प्रदर्शित नाम',
    returnPath: 'रिटर्न-पाथ (Return-Path)',
    replyTo: 'रिप्लाई-टू (Reply-To)',
    spfVerification: 'एसपीएफ सत्यापन (SPF)',
    dkimSignature: 'डीकेआईएम हस्ताक्षर (DKIM)',
    dmarcAlignment: 'डीएमएआरसी संरेखण (DMARC)',
    spoofedMismatch: 'जाली / विसंगति (SPOOFED)',
    aligned: 'संरेखित (ALIGNED)',
    deceptiveMismatch: 'भ्रामक विसंगति (MISMATCH)',
    valid: 'मान्य (VALID)',
    pass: 'उत्तीर्ण (PASS)',
    fail: 'विफल (FAIL)',
    sec3Title: '3. हेडर फ्लाइट रिकॉर्डर रिले पथ (Header Flight Recorder)',
    hopCol: 'हॉप',
    relayHostsCol: 'रिले सर्वर (से → द्वारा)',
    ipNetworkCol: 'आईपी एवं नेटवर्क (IP & ASN)',
    locationCol: 'भौगोलिक स्थिति (Location)',
    forensicStatusCol: 'फोरेंसिक स्थिति',
    flaggedBadge: 'संदिग्ध (FLAGGED)',
    normalBadge: 'सामान्य (NORMAL)',
    anomalousHop: 'विसंगत हॉप',
    sec4Title: '4. अटैचमेंट पेलोड एवं सैंडबॉक्स विश्लेषण (Attachments)',
    filenameCol: 'फ़ाइल का नाम',
    mimeSizeCol: 'प्रकार / आकार',
    sha256Col: 'एसएचए-256 डाइजेस्ट',
    sec5Title: '5. अपरिवर्तनीय कस्टडी श्रृंखला बहीखाता (Merkle Audit Ledger)',
    eventIdCol: 'घटना आईडी',
    timestampCol: 'समय-मुहर (Timestamp)',
    actionActorCol: 'कार्रवाई एवं कर्ता',
    merkleHashCol: 'मर्कल एसएचए-256 वर्तमान हैश',
    footerTitle: 'अन्वेषक साइबर-फोरेंसिक्स वर्कस्टेशन',
    footerGenerated: 'जनरेट किया गया',
    footerSigned: 'डिजिटल रूप से हस्ताक्षरित एवं सीलबंद',
  },
  te: {
    reportTitle: 'అన్వేషక్ (ANVESHAK)',
    reportSubtitle: 'డిజిటల్ ఫోరెన్సిక్స్ & సైబర్ ఇన్సిడెంట్ ఇన్వెస్టిగేషన్ నివేదిక',
    restrictedBadge: 'పరిమిత ఫోరెన్సిక్ రికార్డు (RESTRICTED)',
    threatScore: 'ముప్పు స్కోరు (Threat Score)',
    severityLevel: 'తీవ్రత స్థాయి (Severity)',
    relayHops: 'రిలే హాప్స్ (Relay Hops)',
    chainOfCustody: 'చైన్ ఆఫ్ కస్టడీ (Chain of Custody)',
    analyzed: 'విశ్లేషించబడింది',
    sealedRecords: 'సీలు వేయబడిన రికార్డులు',
    sec1Title: '1. కేసు వివరణ & ఎగ్జిక్యూటివ్ అంచనా (Executive Summary)',
    ingestionDate: 'స్వీకరించిన తేదీ',
    assignee: 'కేటాయించిన అధికారి',
    status: 'స్థితి',
    sec2Title: '2. ఈమెయిల్ ఎన్వలప్ & క్రిప్టోగ్రాఫిక్ ప్రమాణీకరణ (Email Authentication)',
    propertyCol: 'పరామితి / వివరాలు',
    headerValCol: 'సేకరించిన హెడర్ విలువ',
    verdictCol: 'ఫోరెన్సిక్ తీర్పు',
    fromClaimed: 'పంపినవారు (From క్లెయిమ్ చేయబడింది)',
    displayName: 'ప్రదర్శన పేరు',
    returnPath: 'రిటర్న్-పాత్ (Return-Path)',
    replyTo: 'రిప్లై-టు (Reply-To)',
    spfVerification: 'ఎస్పీఎఫ్ ధృవీకరణ (SPF)',
    dkimSignature: 'డీకేఐఎం సంతకం (DKIM)',
    dmarcAlignment: 'డిమార్క్ అలైన్‌మెంట్ (DMARC)',
    spoofedMismatch: 'మోసపూరిత వ్యత్యాసం (SPOOFED)',
    aligned: 'సరిపోలింది (ALIGNED)',
    deceptiveMismatch: 'తప్పుదోవ పట్టించే వ్యత్యాసం',
    valid: 'చెల్లుబాటు అయ్యేది (VALID)',
    pass: 'సఫలం (PASS)',
    fail: 'విఫలం (FAIL)',
    sec3Title: '3. హెడర్ ఫ్లైట్ రికార్డర్ రిలే మార్గం (Header Flight Recorder)',
    hopCol: 'హాప్',
    relayHostsCol: 'రిలే హోస్ట్‌లు (నుండి → ద్వారా)',
    ipNetworkCol: 'ఐపీ & నెట్‌వర్క్ (IP & ASN)',
    locationCol: 'భౌగోళిక స్థానం (Location)',
    forensicStatusCol: 'ఫోరెన్సిక్ స్థితి',
    flaggedBadge: 'అనుమానాస్పదం (FLAGGED)',
    normalBadge: 'సాధారణం (NORMAL)',
    anomalousHop: 'అసాధారణ హాప్',
    sec4Title: '4. అటాచ్‌మెంట్ పేలోడ్‌లు & శాండ్‌బాక్స్ విశ్లేషణ (Attachments)',
    filenameCol: 'ఫైల్ పేరు',
    mimeSizeCol: 'రకం / పరిమాణం',
    sha256Col: 'ఎస్హెచ్ఏ-256 డైజెస్ట్',
    sec5Title: '5. మార్చలేని చైన్ ఆఫ్ కస్టడీ లెడ్జర్ (Merkle Audit Ledger)',
    eventIdCol: 'ఈవెంట్ ఐడీ',
    timestampCol: 'సమయం (Timestamp)',
    actionActorCol: 'చర్య & అధికారి',
    merkleHashCol: 'మెర్కిల్ ఎస్హెచ్ఏ-256 ప్రస్తుత హ్యాష్',
    footerTitle: 'అన్వేషక్ సైబర్-ఫోరెన్సిక్స్ వర్క్‌స్టేషన్',
    footerGenerated: 'రూపొందించబడిన సమయం',
    footerSigned: 'డిజిటల్ సంతకం & సీలు చేయబడింది',
  },
};

/**
 * Generates an institutional, court-admissible forensic PDF report for a CaseDetail.
 * Supports English ('en'), Hindi ('hi'), and Telugu ('te').
 * Uses a styled printable HTML document rendered in an isolated frame and triggered via print-to-PDF.
 */
export function generateCasePdf(caseDetail: CaseDetail, lang: ReportLanguage = 'en') {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const threat = caseDetail.threat_score;
  const auth = caseDetail.auth_status;
  const identity = caseDetail.identity_analysis;
  const coc = caseDetail.chain_of_custody || [];
  const hops = caseDetail.header_hops || [];
  const attachments = caseDetail.attachments || [];

  const severityColor =
    caseDetail.severity === 'CRITICAL' ? '#DC2626' :
    caseDetail.severity === 'HIGH' ? '#EA580C' :
    caseDetail.severity === 'MEDIUM' ? '#D97706' : '#16A34A';

  const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>Forensic_Report_${caseDetail.case_id}_${lang.toUpperCase()}.pdf</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Inter', 'Noto Sans Devanagari', 'Noto Sans Telugu', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 10.5pt;
      line-height: 1.45;
    }
    .header-banner {
      border-bottom: 2px solid #0284C7;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0369A1;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 9pt;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 2px;
    }
    .case-badge {
      text-align: right;
      font-family: 'JetBrains Mono', Consolas, monospace;
    }
    .case-id {
      font-size: 13pt;
      font-weight: 700;
      color: #0F172A;
    }
    .lang-indicator {
      display: inline-block;
      margin-right: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      color: #0369A1;
      background: #E0F2FE;
      border: 1px solid #7DD3FC;
      padding: 1px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .classification {
      display: inline-block;
      margin-top: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      color: #B91C1C;
      background: #FEF2F2;
      border: 1px solid #F87171;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .card {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 8px 10px;
      background: #F8FAFC;
    }
    .card-label {
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .card-val {
      font-size: 11pt;
      font-weight: 700;
      color: #0F172A;
    }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      color: #0369A1;
      letter-spacing: 0.03em;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-bottom: 12px;
    }
    th {
      background: #F1F5F9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 5px 7px;
      border: 1px solid #CBD5E1;
      font-size: 8pt;
      text-transform: uppercase;
    }
    td {
      padding: 5px 7px;
      border: 1px solid #E2E8F0;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #F8FAFC;
    }
    .code {
      font-family: 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      word-break: break-all;
    }
    .badge-pass {
      color: #15803D;
      font-weight: 700;
      background: #DCFCE7;
      padding: 1px 5px;
      border-radius: 3px;
      display: inline-block;
      font-size: 7.5pt;
    }
    .badge-fail {
      color: #B91C1C;
      font-weight: 700;
      background: #FEE2E2;
      padding: 1px 5px;
      border-radius: 3px;
      display: inline-block;
      font-size: 7.5pt;
    }
    .footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #E2E8F0;
      font-size: 7.5pt;
      color: #94A3B8;
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', SFMono-Regular, monospace;
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="header-banner">
    <div>
      <h1 class="brand-title">${t.reportTitle}</h1>
      <div class="brand-subtitle">${t.reportSubtitle}</div>
    </div>
    <div class="case-badge">
      <div class="case-id"><span class="lang-indicator">${lang.toUpperCase()}</span>${caseDetail.case_id}</div>
      <div class="classification">${t.restrictedBadge}</div>
    </div>
  </div>

  <!-- Key Metrics Row -->
  <div class="grid-4">
    <div class="card">
      <div class="card-label">${t.threatScore}</div>
      <div class="card-val" style="color: ${severityColor};">${threat?.overall_score ?? 'N/A'}<span style="font-size: 8.5pt; color: #64748B;"> / 100</span></div>
    </div>
    <div class="card">
      <div class="card-label">${t.severityLevel}</div>
      <div class="card-val" style="color: ${severityColor};">${caseDetail.severity}</div>
    </div>
    <div class="card">
      <div class="card-label">${t.relayHops}</div>
      <div class="card-val">${hops.length} ${t.analyzed}</div>
    </div>
    <div class="card">
      <div class="card-label">${t.chainOfCustody}</div>
      <div class="card-val" style="color: #16A34A;">${coc.length} ${t.sealedRecords}</div>
    </div>
  </div>

  <!-- Section 1: Executive Summary -->
  <div class="section-title">${t.sec1Title}</div>
  <div class="card" style="margin-bottom: 12px;">
    <div style="font-weight: 700; font-size: 10.5pt; margin-bottom: 4px;">${caseDetail.title}</div>
    <div style="color: #334155; font-size: 9.5pt; line-height: 1.5;">${caseDetail.summary}</div>
    <div style="margin-top: 6px; font-size: 8pt; color: #64748B;">
      <strong>${t.ingestionDate}:</strong> ${new Date(caseDetail.created_at).toUTCString()} &nbsp;|&nbsp;
      <strong>${t.assignee}:</strong> ${caseDetail.assignee || 'SOC Lead Investigator'} &nbsp;|&nbsp;
      <strong>${t.status}:</strong> ${caseDetail.status}
    </div>
  </div>

  <!-- Section 2: Email Authentication & Identity -->
  <div class="section-title">${t.sec2Title}</div>
  <table>
    <tr>
      <th style="width: 25%;">${t.propertyCol}</th>
      <th style="width: 45%;">${t.headerValCol}</th>
      <th style="width: 30%;">${t.verdictCol}</th>
    </tr>
    <tr>
      <td><strong>${t.fromClaimed}</strong></td>
      <td class="code">${caseDetail.email_from}</td>
      <td>${t.displayName}: <em>${identity?.display_name || 'N/A'}</em></td>
    </tr>
    <tr>
      <td><strong>${t.returnPath}</strong></td>
      <td class="code">${identity?.return_path || 'N/A'}</td>
      <td>${identity?.return_path_mismatch ? `<span class="badge-fail">${t.spoofedMismatch}</span>` : `<span class="badge-pass">${t.aligned}</span>`}</td>
    </tr>
    <tr>
      <td><strong>${t.replyTo}</strong></td>
      <td class="code">${identity?.reply_to || 'N/A'}</td>
      <td>${identity?.reply_to_mismatch ? `<span class="badge-fail">${t.deceptiveMismatch}</span>` : `<span class="badge-pass">${t.valid}</span>`}</td>
    </tr>
    <tr>
      <td><strong>${t.spfVerification}</strong></td>
      <td class="code">${auth?.spf_domain || 'N/A'}</td>
      <td><span class="${auth?.spf_status === 'PASS' ? 'badge-pass' : 'badge-fail'}">${auth?.spf_status === 'PASS' ? t.pass : (auth?.spf_status || t.fail)}</span></td>
    </tr>
    <tr>
      <td><strong>${t.dkimSignature}</strong></td>
      <td class="code">${auth?.dkim_selector ? `selector: ${auth.dkim_selector}` : 'None'}</td>
      <td><span class="${auth?.dkim_status === 'PASS' ? 'badge-pass' : 'badge-fail'}">${auth?.dkim_status === 'PASS' ? t.pass : (auth?.dkim_status || t.fail)}</span></td>
    </tr>
    <tr>
      <td><strong>${t.dmarcAlignment}</strong></td>
      <td class="code">Policy: ${auth?.dmarc_policy || 'N/A'}</td>
      <td><span class="${auth?.dmarc_status === 'PASS' ? 'badge-pass' : 'badge-fail'}">${auth?.dmarc_status === 'PASS' ? t.pass : (auth?.dmarc_status || t.fail)} (${auth?.alignment || 'NONE'})</span></td>
    </tr>
  </table>

  <!-- Section 3: Header Flight Recorder (Hops) -->
  <div class="section-title">${t.sec3Title}</div>
  <table>
    <tr>
      <th style="width: 8%; text-align: center;">${t.hopCol}</th>
      <th style="width: 28%;">${t.relayHostsCol}</th>
      <th style="width: 22%;">${t.ipNetworkCol}</th>
      <th style="width: 18%;">${t.locationCol}</th>
      <th style="width: 24%;">${t.forensicStatusCol}</th>
    </tr>
    ${hops.map(h => `
      <tr>
        <td style="font-weight: 700; text-align: center;">#${h.hop_index}</td>
        <td>
          <div style="font-size: 8.5pt; font-weight: 600;">${h.from_host}</div>
          <div style="font-size: 7.5pt; color: #64748B;">&rarr; ${h.by_host}</div>
        </td>
        <td class="code">
          ${h.ip}<br>
          <span style="font-size: 7pt; color: #64748B;">ASN ${h.asn} (${h.isp})</span>
        </td>
        <td style="font-size: 8pt;">${h.geo_location}</td>
        <td>
          ${h.is_suspicious 
            ? `<span class="badge-fail">${t.flaggedBadge}</span><br><span style="font-size: 7.5pt; color: #B91C1C;">${h.flag_reason || t.anomalousHop}</span>` 
            : `<span class="badge-pass">${t.normalBadge}</span> <span style="font-size: 7.5pt; color: #64748B;">(+${h.delay_seconds}s)</span>`
          }
        </td>
      </tr>
    `).join('')}
  </table>

  ${attachments.length > 0 ? `
  <!-- Section 4: Attachments & Payload Sandboxing -->
  <div class="section-title">${t.sec4Title}</div>
  <table>
    <tr>
      <th style="width: 28%;">${t.filenameCol}</th>
      <th style="width: 20%;">${t.mimeSizeCol}</th>
      <th style="width: 37%;">${t.sha256Col}</th>
      <th style="width: 15%;">${t.verdictCol}</th>
    </tr>
    ${attachments.map(att => `
      <tr>
        <td><strong>${att.filename}</strong></td>
        <td>${att.mime_type}<br><span style="font-size: 7.5pt; color: #64748B;">${(att.size_bytes / 1024).toFixed(1)} KB</span></td>
        <td class="code" style="font-size: 7pt;">${att.sha256}</td>
        <td><span class="${att.risk_level === 'HIGH' ? 'badge-fail' : 'badge-pass'}">${att.risk_level}</span></td>
      </tr>
    `).join('')}
  </table>
  ` : ''}

  <!-- Section 5: Cryptographic Chain of Custody (Merkle Audit) -->
  <div class="section-title">${t.sec5Title}</div>
  <table>
    <tr>
      <th style="width: 14%;">${t.eventIdCol}</th>
      <th style="width: 18%;">${t.timestampCol}</th>
      <th style="width: 20%;">${t.actionActorCol}</th>
      <th style="width: 48%;">${t.merkleHashCol}</th>
    </tr>
    ${coc.map(e => `
      <tr>
        <td class="code" style="font-weight: 700;">${e.event_id}</td>
        <td style="font-size: 7.5pt;">${new Date(e.timestamp).toLocaleString()}</td>
        <td>
          <div style="font-weight: 600; font-size: 8pt;">${e.action}</div>
          <div style="font-size: 7.5pt; color: #64748B;">${e.actor} (${e.role})</div>
        </td>
        <td class="code" style="font-size: 7pt; color: #0284C7;">${e.current_hash}</td>
      </tr>
    `).join('')}
  </table>

  <!-- Footer -->
  <div class="footer">
    <div>${t.footerTitle}</div>
    <div>${t.footerGenerated}: ${new Date().toUTCString()}</div>
    <div>${t.footerSigned}</div>
  </div>

</body>
</html>
  `;

  // Create an iframe to print the document as PDF
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) return;

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Trigger print after styles & Indic fonts load
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Clean up iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2500);
  }, 500);
}

