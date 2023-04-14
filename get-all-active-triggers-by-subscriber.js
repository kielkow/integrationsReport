require('dotenv/config');

const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const ObjectsToCsv = require('objects-to-csv');

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
                    activeTriggers.push({
                        Job: trigger.name,
                        File: trigger.automationName,
                        Project: trigger.project.name,
                        Tenant: trigger.tenant.title,
                        Created_At: moment(trigger.createdAt).format('YYYY-MM-DD'),
                    });
                }

                skip++;
                console.log(skip);
            }
            else {
                hasMore = false;
            }
        }

        console.log(`Total of active triggers: ${activeTriggers.length}`);

        const csv = new ObjectsToCsv(activeTriggers);

        if (fs.existsSync('./samsung-active-triggers.csv')) {
            fs.unlinkSync('./samsung-active-triggers.csv');
        }

        await csv.toDisk('./samsung-active-triggers.csv');
    }
    catch (error) {
        console.error(error)
    }
}

report();
