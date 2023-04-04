require('dotenv/config');

const axios = require('axios');

const subscriber = '5c73ef1878fc77121074e08c'; // samsung

let skip = 0;
let allHits = [];
let hasMore = true;

const report = async () => {
    try {
        while (hasMore) {
            const { data: response } = await axios({
                method: "get",
                url: "https://api-logs.linkapi.solutions/v4/traces/request",
                params: {
                    subscriber,
                    limit: 20,
                    skip,
                    origin: 'NEW%20ENGINE',
                    startDate: '2023-03-01T00:00:01-03:00',
                    endDate: '2023-03-30T23:59:59-03:00',
                },
                headers: {
                    authorization: `Bearer ${process.env.TOKEN}`
                },
            });

            const hits = response.data;

            if (hits.length) {
                for (const hit of hits) {
                    allHits.push({ requestId: hit.requestId });
                }

                skip++;
                console.log(skip);
            }
            else {
                hasMore = false;
            }
        }

        console.log(`Total of hits: ${allHits.length}`);
    }
    catch (error) {
        console.error(error)
    }
}

report();
