import { ExtractedEmail, AnalysisVerdict, TraceLinkResult } from '../types/investigation';

const DEFAULT_API_BASE = 'http://localhost:8000/api/v1';

export class TraceXClient {
  private apiBase: string;

  constructor(apiBase = DEFAULT_API_BASE) {
    this.apiBase = apiBase;
  }

  async analyzeEmail(email: ExtractedEmail): Promise<AnalysisVerdict> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const response = await fetch(`${this.apiBase}/extension/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: email.source,
          sender: email.sender,
          recipients: email.recipients,
          subject: email.subject,
          timestamp: email.timestamp,
          body_text: email.bodyText,
          raw_headers: email.rawHeaders,
          urls: email.urls,
          message_id: email.messageId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before analyzing again.');
        }
        throw new Error(`Server returned error status (${response.status})`);
      }

      const data = await response.json();
      return data as AnalysisVerdict;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Analysis timed out. TRACE-X investigation engine did not respond in time.');
      }
      throw new Error(err.message || 'Unable to connect to TRACE-X forensic backend.');
    }
  }

  async traceLink(url: string): Promise<TraceLinkResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.apiBase}/extension/trace-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Link trace failed (${response.status})`);
      }

      return (await response.json()) as TraceLinkResult;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(err.message || 'Failed to analyze URL intelligence.');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:8000/health', { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const tracexClient = new TraceXClient();
