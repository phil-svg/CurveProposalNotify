import { EventEmitter } from "events";
import { formatProposalData, telegramBotMain } from "./utils/telegram/TelegramBot.js";
import { fetchLast20Proposal, getVoteFromLAF } from "./utils/subgraph/Proposal.js";
import { getNotifiedIds, storeNotifiedId } from "./utils/memory/storage.js";
import { sleep } from "./utils/helper.js";

console.clear();

const ENV = "prod";
// const ENV = "test";

const eventEmitter = new EventEmitter();

async function fetchAndNotify() {
  const reversedProposals = await fetchLast20Proposal();
  if (!reversedProposals) return;
  const lastProposals = [...reversedProposals.proposals].reverse();

  const notifiedIds = getNotifiedIds();

  for (const proposal of lastProposals) {
    if (notifiedIds.includes(Number(proposal.voteId))) continue;

    const voteFromLAF = await getVoteFromLAF(Number(proposal.voteId));
    console.log("\nfetching metadata for vote id", proposal.voteId);
    console.log("voteFromLAF.metadata", voteFromLAF.metadata);
    if (typeof voteFromLAF.metadata !== "string" || voteFromLAF.metadata.length < 5) continue;

    const formattedProposal = await formatProposalData(proposal, voteFromLAF.metadata);
    eventEmitter.emit("newMessage", formattedProposal);

    storeNotifiedId(Number(proposal.voteId));
    await sleep(1000); // Wait for 1 seconds
  }
}

async function main() {
  await telegramBotMain(ENV, eventEmitter);
  await fetchAndNotify();
  setInterval(fetchAndNotify, 60000);
}

await main();
