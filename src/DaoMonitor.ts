import { EventEmitter } from "events";
import { formatProposalData, telegramBotMain } from "./utils/telegram/TelegramBot.js";
import { fetchLast10Proposal, getVoteFromLAF } from "./utils/subgraph/Proposal.js";
import { getNotifiedIds, storeNotifiedId } from "./utils/memory/storage.js";
import { sleep } from "./utils/helper.js";

console.clear();

const ENV = "prod";
// const ENV = "test";

const eventEmitter = new EventEmitter();

async function fetchAndNotify() {
  const last10Proposal = await fetchLast10Proposal();
  const notifiedIds = getNotifiedIds();

  for (const proposal of last10Proposal.proposals) {
    if (!notifiedIds.includes(proposal.voteId)) {
      const voteFromLAF = await getVoteFromLAF(proposal.voteId);
      if (voteFromLAF.metadata === "") continue;
      const formattedProposal = await formatProposalData(proposal, voteFromLAF.metadata);
      console.log(`sending message for ${proposal.voteId}`);
      eventEmitter.emit("newMessage", formattedProposal);
      storeNotifiedId(proposal.voteId);
      await sleep(1000); // Wait for 1 seconds
    }
  }
}

async function main() {
  await telegramBotMain(ENV, eventEmitter);
  await fetchAndNotify();
  setInterval(fetchAndNotify, 60000);
}

await main();
