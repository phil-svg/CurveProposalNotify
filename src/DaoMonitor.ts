import { EventEmitter } from 'events';
import { formatPassedVoteData, formatProposalData, telegramBotMain } from './utils/telegram/TelegramBot.js';
import { fetchLast25Proposal } from './utils/subgraph/Proposal.js';
import {
  getNotifiedIds,
  getNotifiedIdsPassedVotes,
  storeNotifiedId,
  storeNotifiedIdPassedVotes,
} from './utils/memory/storage.js';
import { sleep } from './utils/helper.js';

console.clear();

const ENV = 'prod';
// const ENV = 'test';

const eventEmitter = new EventEmitter();

async function fetchAndNotify_New_Votes() {
  const reversedProposals = await fetchLast25Proposal();
  if (!reversedProposals) return;
  const lastProposals = [...reversedProposals.proposals].reverse();

  const notifiedIds = getNotifiedIds();

  for (const proposal of lastProposals) {
    if (notifiedIds.includes(Number(proposal.vote_id))) continue;

    if (typeof proposal.metadata !== 'string' || proposal.metadata.length < 5) continue;

    const formattedProposal = await formatProposalData(proposal, proposal.metadata);
    eventEmitter.emit('newMessage', formattedProposal);

    storeNotifiedId(Number(proposal.vote_id));
    await sleep(1000); // Wait for 1 seconds
  }
}

async function fetchAndNotify_Passed_Votes() {
  const reversedProposals = await fetchLast25Proposal();
  if (!reversedProposals) return;
  const lastProposals = [...reversedProposals.proposals].reverse();

  const notifiedIds = getNotifiedIdsPassedVotes();

  for (const proposal of lastProposals) {
    if (notifiedIds.includes(Number(proposal.vote_id))) continue;

    if (typeof proposal.metadata !== 'string' || proposal.metadata.length < 5) continue;

    const formattedPassedVote = await formatPassedVoteData(proposal, proposal.metadata);
    if (formattedPassedVote === 'denied') {
      storeNotifiedIdPassedVotes(Number(proposal.vote_id));
      continue;
    }
    if (formattedPassedVote) {
      storeNotifiedIdPassedVotes(Number(proposal.vote_id));
      eventEmitter.emit('newMessage', formattedPassedVote);
    }
    await sleep(1000); // Wait for 1 seconds
  }
}

async function main() {
  await telegramBotMain(ENV, eventEmitter);

  await fetchAndNotify_New_Votes();
  await fetchAndNotify_Passed_Votes();

  setInterval(async () => {
    await fetchAndNotify_New_Votes();
    await fetchAndNotify_Passed_Votes();
  }, 60000);

  console.log('iteration complete, waiting for next cycle');
}

await main();
