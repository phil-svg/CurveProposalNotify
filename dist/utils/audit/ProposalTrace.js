import axios from 'axios';
const PROPOSAL_TRACE_BASE = 'https://proposal-trace.wavey.info';
// give the audit API up to 90 minutes per vote before reporting without a review
const AUDIT_MAX_WAIT_SECONDS = 90 * 60;
export async function fetchProposalAudit(voteType, voteId) {
    // Curve Ownership and Parameter are independent proposal namespaces on the audit API.
    const namespace = voteType.toLowerCase().includes('parameter') ? 'parameter' : 'ownership';
    try {
        const response = await axios.get(`${PROPOSAL_TRACE_BASE}/v1/curve/${namespace}/${voteId}`, { timeout: 15000 });
        return response.data;
    }
    catch (error) {
        return null; // audit may not exist yet for a brand-new vote
    }
}
export function isAuditComplete(audit) {
    var _a, _b;
    return Boolean(audit && ((_a = audit.assessment) === null || _a === void 0 ? void 0 : _a.status) === 'complete' && ((_b = audit.assessment) === null || _b === void 0 ? void 0 : _b.summary));
}
// 'enrich' = audit ready, send with the yRisk Agentic Review block
// 'wait'   = no audit yet and vote younger than 90 min: skip, retry next cycle
// 'plain'  = 90 min are up without an audit: send the unchanged message format
export function decideAuditHandling(proposal, audit, nowSeconds) {
    if (isAuditComplete(audit))
        return 'enrich';
    const voteAgeSeconds = nowSeconds - Number(proposal.start_date);
    return voteAgeSeconds < AUDIT_MAX_WAIT_SECONDS ? 'wait' : 'plain';
}
//# sourceMappingURL=ProposalTrace.js.map