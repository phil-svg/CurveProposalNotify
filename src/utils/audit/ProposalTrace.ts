import axios from 'axios';
import { Proposal } from '../subgraph/Proposal.js';

const PROPOSAL_TRACE_BASE = 'https://proposal-trace.wavey.info';

// give the audit API up to 90 minutes per vote before reporting without a review
const AUDIT_MAX_WAIT_SECONDS = 90 * 60;

export interface ProposalAudit {
  id: number;
  source_id: string;
  assessed_at: string;
  assessment: {
    status: 'complete' | 'inconclusive';
    summary: string;
    findings: string[];
    unknowns: string[];
    risk: {
      level: string;
      basis: 'evaluated' | 'uncertainty_floor';
    };
  };
  links: {
    report: string;
  };
  report_markdown: string;
}

export async function fetchProposalAudit(voteType: string, voteId: number): Promise<ProposalAudit | null> {
  // Curve Ownership and Parameter are independent proposal namespaces on the audit API.
  const namespace = voteType.toLowerCase().includes('parameter') ? 'parameter' : 'ownership';
  try {
    const response = await axios.get(`${PROPOSAL_TRACE_BASE}/v1/curve/${namespace}/${voteId}`, { timeout: 15000 });
    return response.data as ProposalAudit;
  } catch (error) {
    return null; // audit may not exist yet for a brand-new vote
  }
}

export function isAuditComplete(audit: ProposalAudit | null): boolean {
  return Boolean(audit && audit.assessment?.status === 'complete' && audit.assessment?.summary);
}

// 'enrich' = audit ready, send with the yRisk Agentic Review block
// 'wait'   = no audit yet and vote younger than 90 min: skip, retry next cycle
// 'plain'  = 90 min are up without an audit: send the unchanged message format
export function decideAuditHandling(
  proposal: Proposal,
  audit: ProposalAudit | null,
  nowSeconds: number
): 'enrich' | 'wait' | 'plain' {
  if (isAuditComplete(audit)) return 'enrich';
  const voteAgeSeconds = nowSeconds - Number(proposal.start_date);
  return voteAgeSeconds < AUDIT_MAX_WAIT_SECONDS ? 'wait' : 'plain';
}
