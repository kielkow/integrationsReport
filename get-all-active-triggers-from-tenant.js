require('dotenv/config');

const axios = require('axios');

const subscriber = '5c73ef1878fc77121074e08c'; // samsung

let skip = 0;
let activeTriggers = [];
let hasMore = true;

const report = async () => {
    try {
        while (hasMore) {
            const { data: response } = await axios({
                method: "get",
                url: "https://api-ultron.linkapi.solutions/v3/triggers",
                params: {
                    subscriber,
                    limit: 20,
                    isActive: true,
                    skip,
                    _sort_displayName: 'asc',
                },
                headers: {
                    authorization: `Bearer ${process.env.TOKEN}`
                },
            });

            const triggers = response.data;

            if (triggers.length) {
                for (const trigger of triggers) {
                    activeTriggers.push({ name: trigger.automationName });
                }

                skip++;
                console.log(skip);
            }
            else {
                hasMore = false;
            }
        }

        console.log(`Total of active triggers: ${activeTriggers.length}`);
    }
    catch (error) {
        console.error(error)
    }
}

report();
