require('dotenv/config');

const fs = require('fs');
const axios = require('axios');
const lodash = require('lodash');
const ObjectsToCsv = require('objects-to-csv');

let skip = 0;
let activeGateways = [];
let hasMore = true;

const report = async () => {
    try {
        while (hasMore) {
            const { data: response } = await axios({
                method: "get",
                url: "https://api-ultron.linkapi.solutions/v3/projects",
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

            const gateways = response.data;

            if (gateways.length) {
                for (const gateway of gateways) {
                    activeGateways.push({ name: gateway.name });
                }

                skip++;
                console.log(skip);
            }
            else {
                hasMore = false;
            }
        }

        console.log(activeGateways);

        const csv = new ObjectsToCsv(activeGateways);

        if (fs.existsSync('./samsung-active-gateways.csv')) {
            fs.unlinkSync('./samsung-active-gateways.csv');
        }

        await csv.toDisk('./samsung-active-gateways.csv');
    }
    catch (error) {
        console.error(error)
    }
}

report();
