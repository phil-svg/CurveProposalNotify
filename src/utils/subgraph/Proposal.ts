import axios from 'axios';

export async function fetchLast25Proposal(): Promise<ProposalResponse | null> {
  try {
    const response = await axios.get(
      'https://prices.curve.finance/v1/dao/proposals?pagination=25&page=1&status_filter=all&type_filter=all'
    );
    return response.data as ProposalResponse;
  } catch (error) {
    console.log('Error fetching data: ', error);
    return null;
  }
}

export type ProposalResponse = {
  proposals: Proposal[];
};

export interface Proposal {
  tx: string;
  vote_id: number;
  vote_type: string;
  creator: string;
  start_date: number;
  snapshot_block: number;
  ipfs_metadata: string;
  metadata: string;
  votes_for: string;
  votes_against: string;
  vote_count: number;
  support_required: string;
  min_accept_quorum: string;
  total_supply: string;
  executed: boolean;
  transaction_hash: string;
}
