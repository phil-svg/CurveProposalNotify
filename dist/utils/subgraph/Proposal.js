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
const GET_LATEST_PROPOSAL_FULL = gql `
  {
    proposals(first: 10, orderBy: startDate, orderDirection: desc) {
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
const GET_LATEST_PROPOSAL_SHORTEN = gql `
  {
    proposals(first: 20, orderBy: startDate, orderDirection: desc) {
      voteId
      tx
      voteType
      creator {
        id
      }
      metadata
      totalSupply
      supportRequired
      minAcceptQuorum
    }
  }
`;
export async function fetchLast20Proposal() {
    try {
        const response = await client.query({ query: GET_LATEST_PROPOSAL_SHORTEN });
        return response.data;
    }
    catch (error) {
        console.log("Error fetching data: ", error);
        return null;
    }
}
export async function fetchLast10ProposalLong() {
    try {
        const response = await client.query({ query: GET_LATEST_PROPOSAL_FULL });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching data: ", error);
        throw error;
    }
}
export async function getVoteFromLAF(voteId) {
    const BASE_URL = "https://api-py.llama.airforce/curve/v1/dao/proposals";
    const endpoint = isNaN(voteId) || voteId <= 0 ? "parameter" : "ownership";
    const response = await fetch(`${BASE_URL}/${endpoint}/${voteId}`, {
        method: "GET",
        headers: {
            accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
//# sourceMappingURL=Proposal.js.map