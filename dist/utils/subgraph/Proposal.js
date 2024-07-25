import axios from 'axios';
export async function fetchLast25Proposal() {
    try {
        const response = await axios.get('https://prices.curve.fi/v1/dao/proposals?pagination=25&page=1&status_filter=all&type_filter=all');
        return response.data;
    }
    catch (error) {
        console.log('Error fetching data: ', error);
        return null;
    }
}
//# sourceMappingURL=Proposal.js.map