import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import { checkIfVoteGotDenied, checkIfVotePassed } from "../helper.js";
dotenv.config({ path: "../.env" });

function getTxHashURLfromEtherscan(txHash: string) {
  return "https://etherscan.io/tx/" + txHash;
}

function hyperlink(link: string, name: string): string {
  return "<a href='" + link + "/'> " + name + "</a>";
}

let sentMessages: Record<string, boolean> = {};
export function send(bot: any, message: string, groupID: number) {
  const key = `${groupID}:${message}`;

  if (sentMessages[key]) {
    // console.log("This message has already been sent to this group in the past 30 seconds.");
    return;
  }

  bot.sendMessage(groupID, message, { parse_mode: "HTML", disable_web_page_preview: "true" });

  // Track the message as sent
  sentMessages[key] = true;

  // Delete the message from tracking after 30 seconds
  setTimeout(() => {
    delete sentMessages[key];
  }, 30000); // 30000 ms = 30 seconds
}

export function formatScript(script: string): string {
  const scriptLines = script.split("\n");
  let formattedOutput = "";

  let currentBlock: any = {};

  for (const line of scriptLines) {
    if (line.includes("Call via agent")) {
      currentBlock.agent = `Called by Agent: ${line.split("(")[1].split(")")[0]}`;
    } else if (line.includes("Function")) {
      currentBlock.function = `Function Name: ${line.split(":")[1].trim()}`;
    } else if (line.includes("To")) {
      currentBlock.to = `Target Address: ${line.split(":")[1].trim()}`;
    } else if (line.startsWith(" └─ Inputs:")) {
      currentBlock.inputs = line
        .split("Inputs: ")[1]
        .slice(1, -1)
        .split("), (")
        .map((input) => {
          const [_, type, name, value] = input.match(/(.+?), '(.+?)', (.+?)$/) || [];
          const strippedName = name ? name.replace(/^_/, "") : ""; // removing leading underscore
          return strippedName && value ? `  - ${strippedName}: ${value.trim()}` : null;
        })
        .filter(Boolean); // filter(Boolean) will remove any null entries
    } else if (line === "") {
      if (currentBlock.function && currentBlock.to) {
        formattedOutput += `${currentBlock.agent}\n${currentBlock.function}\n${currentBlock.to}\n${currentBlock.inputs ? currentBlock.inputs.join("\n") : ""}\n\n`;
        currentBlock = {};
      }
    }
  }

  return formattedOutput;
}

export async function formatProposalData(proposal: any, metadata: string): Promise<string> {
  const voteType = proposal.voteType.toLowerCase().includes("ownership") ? "Ownership" : proposal.voteType.toLowerCase().includes("parameter") ? "Parameter" : proposal.voteType; // This will default to proposal.voteType if neither 'ownership' nor 'parameter' is found.

  const totalSupplyNumber = parseFloat(proposal.totalSupply) / 1e18;
  const quorum = ((totalSupplyNumber * parseFloat(proposal.minAcceptQuorum)) / (1e18 * 1e6)).toFixed(0);
  const support = (parseFloat(proposal.supportRequired) / 1e16).toFixed(0);

  const txHyperlink = getTxHashURLfromEtherscan(proposal.tx);

  return `
    🗞️ New Proposal for ${voteType}

${metadata}
Requirements: ${quorum}m veCRV | Support: ${support}%
Links:${hyperlink(txHyperlink, "etherscan")} |${hyperlink("https://gov.curve.fi/", "gov.curve.fi")} |${hyperlink("https://curvemonitor.com/#/dao/proposals", "curvemonitor")} 
  `;
}

export async function formatPassedVoteData(proposal: any, metadata: string): Promise<string | null | "denied"> {
  const voteGotDenied = await checkIfVoteGotDenied(proposal);
  if (voteGotDenied) return "denied";
  const voteIsPassed = await checkIfVotePassed(proposal);

  // console.log("proposal", proposal);

  console.log(proposal.voteId, "voteIsPassed", voteIsPassed);
  if (!voteIsPassed) return null;

  const totalSupplyNumber = parseFloat(proposal.totalSupply) / 1e18; // Convert total supply from WEI to Ether
  const votesForNumber = parseFloat(proposal.votesFor) / 1e18; // Convert votes for from WEI to Ether
  const votesAgainstNumber = parseFloat(proposal.votesAgainst) / 1e18; // Convert votes for from WEI to Ether
  const quorumRequired = (totalSupplyNumber * parseFloat(proposal.minAcceptQuorum)) / 1e18;
  const quorumAchieved = votesForNumber + votesAgainstNumber; // Quorum achieved is the votes for
  const percentageYea = ((votesForNumber / quorumAchieved) * 100).toFixed(2); // Calculate percentage of yea votes

  const txHyperlink = getTxHashURLfromEtherscan(proposal.tx);

  return `
  🗞️ Vote Passed ✓

${metadata}

Total Votes: ${(quorumAchieved / 1e6).toFixed(0)}m veCRV | Yea: ${percentageYea}%
Links:${hyperlink(txHyperlink, "etherscan")} |${hyperlink("https://gov.curve.fi/", "gov.curve.fi")} |${hyperlink("https://curvemonitor.com/#/dao/proposals", "curvemonitor")} 
  `;
}

export async function telegramBotMain(env: string, eventEmitter: EventEmitter) {
  eventEmitter.on("newMessage", (message: string) => {
    if (groupID) {
      send(bot, message, parseInt(groupID));
    }
  });

  let telegramGroupToken: string | undefined;
  let groupID: string | undefined;

  if (env == "prod") {
    telegramGroupToken = process.env.TELEGRAM_CURVE_PROPOSAL_MONITOR_PROD_KEY!;
    groupID = process.env.TELEGRAM_PROD_GROUP_ID!;
  }
  if (env == "test") {
    telegramGroupToken = process.env.TELEGRAM_CURVE_PROPOSAL_MONITOR_TEST_KEY!;
    groupID = process.env.TELEGRAM_TEST_GROUP_ID!;
  }

  const bot = new TelegramBot(telegramGroupToken!, { polling: true });

  bot.on("message", async (msg: any) => {
    if (msg && msg.text && msg.text.toLowerCase() === "bot u with us") {
      await new Promise((resolve) => setTimeout(resolve, 945));
      if (groupID) {
        bot.sendMessage(msg.chat.id, "yep");
      }
    }
  });
}
