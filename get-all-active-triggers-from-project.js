require('dotenv/config');

const axios = require('axios');

const project = '5cbdba6c0c440212ecafa92d';

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
                    subscriber: '5c73ef1878fc77121074e08c',
                    limit: 20,
                    isActive: true,
                    project,
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

        const triggersSet = new Set(activeTriggers.map(
            trigger => trigger.name
        ));

        let triggers = [];
        triggersSet.forEach((value, key, set) => {
            triggers.push({
                name: value,
            })
        });

        console.log(triggers);
    }
    catch (error) {
        console.error(error)
    }
}

report();
