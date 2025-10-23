import { Proposal } from './subgraph/Proposal.js';
import Web3 from 'web3';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkIfVotePassed(proposal: Proposal): Promise<boolean> {
  const totalSupplyNumber = parseFloat(proposal.total_supply) / 1e18;
  const votesForNumber = parseFloat(proposal.votes_for) / 1e18;

  // Calculate quorum: the percentage of total supply that voted for the proposal
  const quorumPercent = (votesForNumber / totalSupplyNumber) * 100;

  // Calculate the required quorum from proposal data
  const requiredQuorum = (parseFloat(proposal.min_accept_quorum) / 1e18) * 100; // Convert to percentage

  // Calculate support: the percentage of votes that were for the proposal
  const supportRequiredPercent = (parseFloat(proposal.support_required) / 1e18) * 100; // Convert to percentage

  // Check if the quorum and support requirements are met
  const quorumMet = quorumPercent >= requiredQuorum;
  const supportMet =
    (votesForNumber / (votesForNumber + parseFloat(proposal.votes_against) / 1e18)) * 100 >= supportRequiredPercent;

  // Check if at least 7 days have passed since the start date of the vote
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  const sevenDaysInSeconds = 604800; // 7 days in seconds
  const voteStartTime = proposal.start_date;
  const timeElapsed = currentTime - voteStartTime;
  const sevenDaysPassed = timeElapsed >= sevenDaysInSeconds;

  return quorumMet && supportMet && sevenDaysPassed;
}

export async function checkIfVoteGotDenied(proposal: any): Promise<boolean> {
  const totalSupplyNumber = parseFloat(proposal.total_supply) / 1e18;
  const votesForNumber = parseFloat(proposal.votes_for) / 1e18;

  // Calculate quorum: the percentage of total supply that voted for the proposal
  const quorumPercent = (votesForNumber / totalSupplyNumber) * 100;

  // Calculate the required quorum from proposal data
  const requiredQuorum = (parseFloat(proposal.min_accept_quorum) / 1e18) * 100; // Convert to percentage

  // Calculate support: the percentage of votes that were for the proposal
  const supportRequiredPercent = (parseFloat(proposal.support_required) / 1e18) * 100; // Convert to percentage

  // Check if the quorum and support requirements are met
  const quorumMet = quorumPercent >= requiredQuorum;
  const supportMet =
    (votesForNumber / (votesForNumber + parseFloat(proposal.votes_against) / 1e18)) * 100 >= supportRequiredPercent;

  // Check if at least 7 days have passed since the start date of the vote
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  const sevenDaysInSeconds = 604800; // 7 days in seconds
  const voteStartTime = parseInt(proposal.start_date, 10);
  const timeElapsed = currentTime - voteStartTime;
  const sevenDaysPassed = timeElapsed >= sevenDaysInSeconds;

  return sevenDaysPassed && !(quorumMet && supportMet);
}

export async function checkIfIDisTrusted(id: number) {
  const web3HttpProvider = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_HTTP_MAINNET!));
  const abi: any = [
    {
      inputs: [],
      name: 'BRIDGE_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'FRAXTAL_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'LENDING_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'MAX_PROPOSALS_TO_CHECK',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'METAPOOL_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'REGULAR_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'ROOT_GAUGE_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'STABLESWAP_PROXY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'TRICRYPTO_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'TWOCRYPTO_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'TWO_CRYPTO_FACTORY',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'dao',
      outputs: [{ internalType: 'contract IDAO', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getActiveProposalDetails',
      outputs: [
        {
          components: [
            { internalType: 'uint256', name: 'id', type: 'uint256' },
            { internalType: 'address[]', name: 'gauges', type: 'address[]' },
            { internalType: 'bool', name: 'executed', type: 'bool' },
            { internalType: 'uint256', name: 'startDate', type: 'uint256' },
            { internalType: 'bool', name: 'isValid', type: 'bool' },
          ],
          internalType: 'struct GaugeValidator.ProposalInfo[]',
          name: 'proposals',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getActiveProposalGauges',
      outputs: [{ internalType: 'address[]', name: 'gauges', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
      name: 'getProposalGauges',
      outputs: [{ internalType: 'address[]', name: 'gauges', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'string', name: 'hexString', type: 'string' }],
      name: 'hexToBytes',
      outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'gauge', type: 'address' }],
      name: 'isLPGauge',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'gauge', type: 'address' }],
      name: 'isRootGauge',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'factory', type: 'address' }],
      name: 'isTrustedFactory',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
      name: 'parseGaugeAddresses',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
      name: 'parseGaugeAddressesFromBytes',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'string', name: 'hexString', type: 'string' }],
      name: 'parseGaugeAddressesFromHex',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'gauge', type: 'address' }],
      name: 'validateGauge',
      outputs: [
        { internalType: 'bool', name: 'isValid', type: 'bool' },
        { internalType: 'enum GaugeValidator.GaugeType', name: 'gaugeType', type: 'uint8' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'gauge', type: 'address' }],
      name: 'validateLPGauge',
      outputs: [{ internalType: 'bool', name: '_isValid', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
      name: 'validateProposalGauges',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'gauge', type: 'address' }],
      name: 'validateRootGauge',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];
  const contract = new web3HttpProvider.eth.Contract(abi, '0x60272833edd3f340f6436a8aaa83290c61524c44');
  return await contract.methods.validateProposalGauges(id).call();
}
