export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkIfVotePassed(proposal: any): Promise<boolean> {
  const totalSupplyNumber = parseFloat(proposal.totalSupply) / 1e18;
  const votesForNumber = parseFloat(proposal.votesFor) / 1e18;

  // Calculate quorum: the percentage of total supply that voted for the proposal
  const quorumPercent = (votesForNumber / totalSupplyNumber) * 100;

  // Calculate the required quorum from proposal data
  const requiredQuorum = (parseFloat(proposal.minAcceptQuorum) / 1e18) * 100; // Convert to percentage

  // Calculate support: the percentage of votes that were for the proposal
  const supportRequiredPercent = (parseFloat(proposal.supportRequired) / 1e18) * 100; // Convert to percentage

  // Check if the quorum and support requirements are met
  const quorumMet = quorumPercent >= requiredQuorum;
  const supportMet = (votesForNumber / (votesForNumber + parseFloat(proposal.votesAgainst) / 1e18)) * 100 >= supportRequiredPercent;

  // Check if at least 7 days have passed since the start date of the vote
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  const sevenDaysInSeconds = 604800; // 7 days in seconds
  const voteStartTime = parseInt(proposal.startDate, 10);
  const timeElapsed = currentTime - voteStartTime;
  const sevenDaysPassed = timeElapsed >= sevenDaysInSeconds;

  return quorumMet && supportMet && sevenDaysPassed;
}

export async function checkIfVoteGotDenied(proposal: any): Promise<boolean> {
  const totalSupplyNumber = parseFloat(proposal.totalSupply) / 1e18;
  const votesForNumber = parseFloat(proposal.votesFor) / 1e18;

  // Calculate quorum: the percentage of total supply that voted for the proposal
  const quorumPercent = (votesForNumber / totalSupplyNumber) * 100;

  // Calculate the required quorum from proposal data
  const requiredQuorum = (parseFloat(proposal.minAcceptQuorum) / 1e18) * 100; // Convert to percentage

  // Calculate support: the percentage of votes that were for the proposal
  const supportRequiredPercent = (parseFloat(proposal.supportRequired) / 1e18) * 100; // Convert to percentage

  // Check if the quorum and support requirements are met
  const quorumMet = quorumPercent >= requiredQuorum;
  const supportMet = (votesForNumber / (votesForNumber + parseFloat(proposal.votesAgainst) / 1e18)) * 100 >= supportRequiredPercent;

  // Check if at least 7 days have passed since the start date of the vote
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  const sevenDaysInSeconds = 604800; // 7 days in seconds
  const voteStartTime = parseInt(proposal.startDate, 10);
  const timeElapsed = currentTime - voteStartTime;
  const sevenDaysPassed = timeElapsed >= sevenDaysInSeconds;

  return sevenDaysPassed && !(quorumMet && supportMet);
}
