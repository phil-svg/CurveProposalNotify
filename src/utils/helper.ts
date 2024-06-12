import { Proposal } from './subgraph/Proposal.js';

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
