require('dotenv/config');

const fs = require('fs');
const axios = require('axios');
const lodash = require('lodash');
const ObjectsToCsv = require('objects-to-csv');

let skip = 0;
let activeIntegrations = [];
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
                    activeIntegrations.push({
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

        const orderActiveIntegrationsByTenant = lodash.orderBy(
            activeIntegrations, ['tenant'], ['asc']
        );

        const csv = new ObjectsToCsv(orderActiveIntegrationsByTenant);

        if (fs.existsSync('./samsung-active-automations-group-by-tenant-project.csv')) {
            fs.unlinkSync('./samsung-active-automations-group-by-tenant-project.csv');
        }

        await csv.toDisk('./samsung-active-automations-group-by-tenant-project.csv');
        
        const groupedIntegrationsByTenantAndProject = [];

        const groupedIntegrationsByTenant = lodash.groupBy(
            activeIntegrations, integration => integration.tenant
        );

        for (const tenant of Object.keys(groupedIntegrationsByTenant)) {
            const groupedIntegrationsByProjects = lodash.groupBy(
                groupedIntegrationsByTenant[tenant], integration => integration.project_name
            );

            let projects = [];
            for (const project of Object.keys(groupedIntegrationsByProjects)) {
                projects.push({
                    name: groupedIntegrationsByProjects[project][0].project_name,
                    integrations: groupedIntegrationsByProjects[project].map(integration => ({
                        job_name: integration.job_name,
                        automation_file_name: integration.automation_file_name
                    }))
                })
            }

            groupedIntegrationsByTenantAndProject.push({
                name: tenant,
                projects
            });
        }

        if (fs.existsSync('./samsung-active-automations-group-by-tenant-project.json')) {
            fs.unlinkSync('./samsung-active-automations-group-by-tenant-project.json');
        }

        fs.writeFile(
            "samsung-active-automations-group-by-tenant-project.json",
            JSON.stringify({ tenants: groupedIntegrationsByTenantAndProject }),
            'utf8',
            function (err) {
                if (err) throw err;
                console.log("JSON file has been saved.");
            }
        );
    }
    catch (error) {
        console.error(error)
    }
}

report();
