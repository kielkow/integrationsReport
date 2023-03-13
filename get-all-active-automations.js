require('dotenv/config');

const fs = require('fs');
const axios = require('axios');
const lodash = require('lodash');
const ObjectsToCsv = require('objects-to-csv');

let skip = 0;
let activeAutomations = [];
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
                    skip,
                    _sort_displayName: 'asc'
                },
                headers: {
                    authorization: `Bearer ${process.env.TOKEN}`
                },
            });

            const integrations = response.data;

            if (integrations.length) {
                for (const integration of integrations) {
                    activeAutomations.push({
                        tenant: integration.tenant.title,
                        project_name: integration.project.name,
                        job_name: integration.name,
                        automation_file_name: integration.automationName
                    });
                }

                skip++;
                console.log(skip);
            }
            else {
                hasMore = false;
            }
        }

        const automationsSet = new Set(activeAutomations.map(
            integration => integration.project_name
        ));

        let automations = [];
        automationsSet.forEach((value, key, set) => {
            automations.push({
                name: value,
            })
        });

        const csv = new ObjectsToCsv(automations);

        if (fs.existsSync('./samsung-active-automations.csv')) {
            fs.unlinkSync('./samsung-active-automations.csv');
        }

        await csv.toDisk('./samsung-active-automations.csv');
    }
    catch (error) {
        console.error(error)
    }
}

report();
