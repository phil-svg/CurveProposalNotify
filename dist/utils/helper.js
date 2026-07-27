import Web3 from 'web3';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function checkIfVotePassed(proposal) {
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
    const supportMet = (votesForNumber / (votesForNumber + parseFloat(proposal.votes_against) / 1e18)) * 100 >= supportRequiredPercent;
    // Check if at least 7 days have passed since the start date of the vote
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    const sevenDaysInSeconds = 604800; // 7 days in seconds
    const voteStartTime = proposal.start_date;
    const timeElapsed = currentTime - voteStartTime;
    const sevenDaysPassed = timeElapsed >= sevenDaysInSeconds;
    return quorumMet && supportMet && sevenDaysPassed;
}
export async function checkIfVoteGotDenied(proposal) {
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
    const supportMet = (votesForNumber / (votesForNumber + parseFloat(proposal.votes_against) / 1e18)) * 100 >= supportRequiredPercent;
    // Check if at least 7 days have passed since the start date of the vote
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    const sevenDaysInSeconds = 604800; // 7 days in seconds
    const voteStartTime = parseInt(proposal.start_date, 10);
    const timeElapsed = currentTime - voteStartTime;
    const sevenDaysPassed = timeElapsed >= sevenDaysInSeconds;
    return sevenDaysPassed && !(quorumMet && supportMet);
}
export async function checkIfIDisTrusted(id) {
    const web3HttpProvider = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_HTTP_MAINNET));
    const abi = [
        {
            inputs: [
                { internalType: 'address', name: 'owner_', type: 'address' },
                { internalType: 'address', name: 'proposalModule_', type: 'address' },
                {
                    components: [
                        { internalType: 'address', name: 'factory', type: 'address' },
                        { internalType: 'address', name: 'module', type: 'address' },
                        { internalType: 'uint8', name: 'methodId', type: 'uint8' },
                    ],
                    internalType: 'struct GaugeValidator.FactoryBinding[]',
                    name: 'initialBindings',
                    type: 'tuple[]',
                },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
        },
        { inputs: [], name: 'InvalidPolicy', type: 'error' },
        { inputs: [{ internalType: 'address', name: 'target', type: 'address' }], name: 'MissingCode', type: 'error' },
        { inputs: [{ internalType: 'address', name: 'caller', type: 'address' }], name: 'NotOwner', type: 'error' },
        { inputs: [], name: 'ProposalModuleUnavailable', type: 'error' },
        { inputs: [], name: 'ZeroAddress', type: 'error' },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: 'address', name: 'factory', type: 'address' },
                { indexed: true, internalType: 'address', name: 'module', type: 'address' },
                { indexed: false, internalType: 'uint8', name: 'methodId', type: 'uint8' },
            ],
            name: 'FactoryPolicySet',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
                { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
            ],
            name: 'OwnershipTransferred',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: true, internalType: 'address', name: 'module', type: 'address' }],
            name: 'ProposalModuleSet',
            type: 'event',
        },
        {
            inputs: [],
            name: 'FACTORY_READ_GAS',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'MODULE_CALL_GAS',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
            name: 'analyzeProposalGauges',
            outputs: [
                { internalType: 'bool', name: 'allValid', type: 'bool' },
                {
                    components: [
                        { internalType: 'address', name: 'gauge', type: 'address' },
                        { internalType: 'bool', name: 'valid', type: 'bool' },
                    ],
                    internalType: 'struct IProposalValidationModule.GaugeResult[]',
                    name: 'results',
                    type: 'tuple[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'getActiveProposals',
            outputs: [{ internalType: 'uint256[]', name: 'proposalIds', type: 'uint256[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'owner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'factory', type: 'address' }],
            name: 'policyForFactory',
            outputs: [
                { internalType: 'address', name: 'module', type: 'address' },
                { internalType: 'uint8', name: 'methodId', type: 'uint8' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'proposalModule',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'factory', type: 'address' },
                { internalType: 'address', name: 'module', type: 'address' },
                { internalType: 'uint8', name: 'methodId', type: 'uint8' },
            ],
            name: 'setFactoryPolicy',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'module', type: 'address' }],
            name: 'setProposalModule',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
            name: 'transferOwnership',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'gauge', type: 'address' }],
            name: 'validateGauge',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
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
    ];
    const contract = new web3HttpProvider.eth.Contract(abi, '0x999901076BB47Ae96d135C567610270d006B8684');
    return await contract.methods.validateProposalGauges(id).call();
}
//# sourceMappingURL=helper.js.map