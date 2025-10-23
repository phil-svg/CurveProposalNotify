import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { checkIfIDisTrusted, checkIfVoteGotDenied, checkIfVotePassed } from '../helper.js';
import { Proposal } from '../subgraph/Proposal.js';

dotenv.config({ path: '../.env' });

function getTxHashURLfromEtherscan(txHash: string) {
  return 'https://etherscan.io/tx/' + txHash;
}

function hyperlink(link: string, name: string): string {
  return "<a href='" + link + "/'> " + name + '</a>';
}

let sentMessages: Record<string, boolean> = {};
export function send(bot: any, message: string, groupID: number) {
  const key = `${groupID}:${message}`;

  if (sentMessages[key]) {
    // console.log("This message has already been sent to this group in the past 30 seconds.");
    return;
  }

  bot.sendMessage(groupID, message, { parse_mode: 'HTML', disable_web_page_preview: 'true' });

  // Track the message as sent
  sentMessages[key] = true;

  // Delete the message from tracking after 30 seconds
  setTimeout(() => {
    delete sentMessages[key];
  }, 30000); // 30000 ms = 30 seconds
}

export function formatScript(script: string): string {
  const scriptLines = script.split('\n');
  let formattedOutput = '';

  let currentBlock: any = {};

  for (const line of scriptLines) {
    if (line.includes('Call via agent')) {
      currentBlock.agent = `Called by Agent: ${line.split('(')[1].split(')')[0]}`;
    } else if (line.includes('Function')) {
      currentBlock.function = `Function Name: ${line.split(':')[1].trim()}`;
    } else if (line.includes('To')) {
      currentBlock.to = `Target Address: ${line.split(':')[1].trim()}`;
    } else if (line.startsWith(' └─ Inputs:')) {
      currentBlock.inputs = line
        .split('Inputs: ')[1]
        .slice(1, -1)
        .split('), (')
        .map((input) => {
          const [_, type, name, value] = input.match(/(.+?), '(.+?)', (.+?)$/) || [];
          const strippedName = name ? name.replace(/^_/, '') : ''; // removing leading underscore
          return strippedName && value ? `  - ${strippedName}: ${value.trim()}` : null;
        })
        .filter(Boolean); // filter(Boolean) will remove any null entries
    } else if (line === '') {
      if (currentBlock.function && currentBlock.to) {
        formattedOutput += `${currentBlock.agent}\n${currentBlock.function}\n${currentBlock.to}\n${
          currentBlock.inputs ? currentBlock.inputs.join('\n') : ''
        }\n\n`;
        currentBlock = {};
      }
    }
  }

  return formattedOutput;
}

export async function formatProposalData(proposal: Proposal, metadata: string): Promise<string> {
  const voteType = proposal.vote_type.toLowerCase().includes('ownership')
    ? 'Ownership'
    : proposal.vote_type.toLowerCase().includes('parameter')
    ? 'Parameter'
    : proposal.vote_type; // This will default to proposal.voteType if neither 'ownership' nor 'parameter' is found.
  let urlType;
  if (voteType === 'Ownership') {
    urlType = 'ownership';
  } else {
    urlType = 'parameter';
  }
  const curvemonitorURL = `https://curvemonitor.com/dao/proposal/${urlType}/${proposal.vote_id}`;
  const crvHubURL = `https://crvhub.com/governance/${voteType.toLowerCase()}/${proposal.vote_id}`;
  const curveURL = `https://curve.finance/dao/ethereum/proposals/${proposal.vote_id}-${voteType.toLowerCase()}`;

  const totalSupplyNumber = parseFloat(proposal.total_supply) / 1e18;
  const quorum = ((totalSupplyNumber * parseFloat(proposal.min_accept_quorum)) / (1e18 * 1e6)).toFixed(0);
  const support = (parseFloat(proposal.support_required) / 1e16).toFixed(0);

  const trusted = await checkIfIDisTrusted(proposal.vote_id);

  const txHyperlink = getTxHashURLfromEtherscan(proposal.transaction_hash);

  metadata = metadata.replace(/<>/g, '≺≻');
  if (!trusted) {
    metadata = metadata + '\n⚠️ Gauge was not deployed from trusted factory.';
  }

  return `
    🗞️ New Proposal for ${voteType}

${metadata}
Requirements: ${quorum}m veCRV | Support: ${support}%
Links:${hyperlink(txHyperlink, 'etherscan')} |${hyperlink(curveURL, 'dao.curve.finance')} |${hyperlink(
    curvemonitorURL,
    'curvemonitor'
  )} |${hyperlink(crvHubURL, 'crvhub')}
  `;
}

export async function formatPassedVoteData(proposal: Proposal, metadata: string): Promise<string | null | 'denied'> {
  const voteGotDenied = await checkIfVoteGotDenied(proposal);
  if (voteGotDenied) return 'denied';
  const voteIsPassed = await checkIfVotePassed(proposal);

  // console.log("proposal", proposal);
  // console.log(proposal.voteId, "voteIsPassed", voteIsPassed);

  if (!voteIsPassed) return null;

  const totalSupplyNumber = parseFloat(proposal.total_supply) / 1e18; // Convert total supply from WEI to Ether
  const votesForNumber = parseFloat(proposal.votes_for) / 1e18; // Convert votes for from WEI to Ether
  const votesAgainstNumber = parseFloat(proposal.votes_against) / 1e18; // Convert votes for from WEI to Ether
  const quorumRequired = (totalSupplyNumber * parseFloat(proposal.min_accept_quorum)) / 1e18;
  const quorumAchieved = votesForNumber + votesAgainstNumber; // Quorum achieved is the votes for
  const percentageYea = ((votesForNumber / quorumAchieved) * 100).toFixed(2); // Calculate percentage of yea votes

  const voteType = proposal.vote_type.toLowerCase().includes('ownership')
    ? 'Ownership'
    : proposal.vote_type.toLowerCase().includes('parameter')
    ? 'Parameter'
    : proposal.vote_type; // This will default to proposal.voteType if neither 'ownership' nor 'parameter' is found.
  let urlTypeCurveMonitor;
  if (voteType === 'Ownership') {
    urlTypeCurveMonitor = 'gauge';
  } else {
    urlTypeCurveMonitor = 'parameter';
  }
  const curvemonitorURL = `https://curvemonitor.com/#/dao/proposal/${urlTypeCurveMonitor}/${proposal.vote_id}`;
  const crvHubURL = `https://crvhub.com/governance/${voteType.toLowerCase()}/${proposal.vote_id}`;

  const txHyperlink = getTxHashURLfromEtherscan(proposal.transaction_hash);

  return `
  🗞️ Vote Passed ✓

${metadata}

Total Votes: ${(quorumAchieved / 1e6).toFixed(0)}m veCRV | Yea: ${percentageYea}%
Links:${hyperlink(txHyperlink, 'etherscan')} |${hyperlink(
    'https://gov.curve.finance/',
    'gov.curve.finance'
  )} |${hyperlink(curvemonitorURL, 'curvemonitor')} |${hyperlink(crvHubURL, 'crvhub')}
  `;
}

export async function telegramBotMain(env: string, eventEmitter: EventEmitter) {
  const token =
    env === 'prod'
      ? process.env.TELEGRAM_CURVE_PROPOSAL_MONITOR_PROD_KEY
      : process.env.TELEGRAM_CURVE_PROPOSAL_MONITOR_TEST_KEY;

  const groupIdMonitor = env === 'prod' ? process.env.TELEGRAM_PROD_GROUP_ID : process.env.TELEGRAM_TEST_GROUP_ID;

  const groupIdDiscussion =
    env === 'prod' ? process.env.TELEGRAM_PROD_GROUP_ID_DISCUSSION : process.env.TELEGRAM_TEST_GROUP_ID;

  if (!token) throw new Error('Missing TELEGRAM token');
  if (!groupIdMonitor) throw new Error('Missing monitor group id');
  if (!groupIdDiscussion) throw new Error('Missing discussion group id');

  const CHAT_IDS = [Number(groupIdMonitor), Number(groupIdDiscussion)];

  // No polling: we can still send messages just fine.
  const bot = new TelegramBot(token, { polling: false });

  bot.on('error', (err) => console.error('[telegram_error]', err?.message || err));

  eventEmitter.on('newMessage', async (message: string) => {
    for (const chatId of CHAT_IDS) {
      try {
        send(bot, message, chatId);
      } catch (e: any) {
        console.error(`[send error -> ${chatId}]`, e?.message || e);
      }
    }
  });
}
