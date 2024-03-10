import pkg from "@apollo/client";
const { ApolloClient, InMemoryCache, gql } = pkg;

// ID: Qmf7HuQsR81yMrVH5hfAXEuZipzQpuKoHujuLSroqDvqWu
// QUERIES (HTTP): https://api.thegraph.com/subgraphs/name/convex-community/curve-dao

// from https://curve-subgraphs.gitbook.io/docs/curve-dao-subgraph/entities#proposal

/*
#proposal
+----------------------+----------+----------------------------------------------+
| Field                | Type     | Description                                  |
+----------------------+----------+----------------------------------------------+
| id                   | ID       | Entity ID                                    |
| tx                   | Bytes    | tx hash                                      |
| voteId               | BigInt   | vote id                                      |
| voteType             | VoteType | vote type                                    |
| creator              | User     | user initiating the vote                     |
| startDate            | BigInt   | start date                                   |
| snapshotBlock        | BigInt   | block used for the snapshot                  |
| ipfsMetadata         | String   | IPFS address of the proposals metadata       |
| metadata             | string   | decoding of the proposals metadata           |
| minBalance           | BigInt   | minimum balance required                     |
| minTime              | BigInt   | minimum amount of lock time                  |
| totalSupply          | BigInt   | total supply at the moment of proposal       |
| creatorVotingPower   | BigInt   | creator voting power                         |
| votesFor             | BigInt   | votes in favor                               |
| votesAgainst         | BigInt   | votes against                                |
| votes                | [Vote]   | list of votes                                |
| voteCount            | BigInt   | number of individual votes cast              |
| supportRequired      | BigInt   | support requried                             |
| minAcceptQuorum      | BigInt   | quorum value                                 |
| executed             | Boolean  | whether the proposal has been executed or not|
| execution            | Execution| execution tx details                         |
| script               | Bytes    | proposal calldata                            |
+----------------------+----------+----------------------------------------------+
*/

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/convex-community/curve-dao",
  cache: new InMemoryCache(),
});

const GET_LATEST_PROPOSAL_FULL = gql`
  {
    proposals(first: 25, orderBy: startDate, orderDirection: desc) {
      id
      tx
      voteId
      voteType
      creator {
        id
      }
      startDate
      snapshotBlock
      ipfsMetadata
      metadata
      minBalance
      minTime
      totalSupply
      creatorVotingPower
      votesFor
      votesAgainst
      voteCount
      supportRequired
      minAcceptQuorum
      executed
      execution {
        id
      }
      script
    }
  }
`;

interface User {
  __typename: "User";
  id: string;
}

interface Execution {
  __typename: "Execution";
  id: string;
}

export interface Proposal {
  __typename: "Proposal";
  id: string;
  tx: string;
  voteId: string;
  voteType: string;
  creator: User;
  startDate: string;
  snapshotBlock: string;
  ipfsMetadata: string;
  metadata: string;
  minBalance: string;
  minTime: string;
  totalSupply: string;
  creatorVotingPower: string;
  votesFor: string;
  votesAgainst: string;
  voteCount: string;
  supportRequired: string;
  minAcceptQuorum: string;
  executed: boolean;
  execution: Execution;
  script: string;
}

export type ProposalResponse = {
  proposals: Proposal[];
};

export async function fetchLast25Proposal(): Promise<ProposalResponse | null> {
  try {
    const response = await client.query({ query: GET_LATEST_PROPOSAL_FULL });
    return response.data as ProposalResponse;
  } catch (error) {
    console.log("Error fetching data: ", error);
    return null;
  }
}

interface Vote {
  voteId: number;
  voteType: string;
  creator: string;
  startDate: number;
  snapshotBlock: number;
  ipfsMetadata: string;
  metadata: string;
  votesFor: string;
  votesAgainst: string;
  voteCount: number;
  supportRequired: string;
  minAcceptQuorum: string;
  totalSupply: string;
  executed: boolean;
  tx: string;
  creatorVotingPower: number;
  script: string;
  votes: VoteDetail[];
}

interface VoteDetail {
  tx: string;
  voteId: number;
  voter: string;
  supports: boolean;
  stake: number;
}

export async function getVoteFromLAF(voteId: number, voteType: string): Promise<Vote> {
  const BASE_URL = "https://api-py.llama.airforce/curve/v1/dao/proposals";

  const endpoint = voteType.toLowerCase();

  const response = await fetch(`${BASE_URL}/${endpoint}/${voteId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: Vote = await response.json();

  return data;
}
