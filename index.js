const fs = require('fs');
const axios = require('axios');
const lodash = require('lodash');

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
                    authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg5MDJDMkZEQ0IxNjM2NDk1ODJBQjFCQzNBOTU5MDJDNDhCNzhENjMiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJpUUxDX2NzV05rbFlLckc4T3BXUUxFaTNqV00ifQ.eyJuYmYiOjE2NTgxNTAwMjcsImV4cCI6MTY1ODE3ODgyNywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5saW5rYXBpLmNvbS5iciIsImF1ZCI6WyJodHRwczovL2lkZW50aXR5LmxpbmthcGkuY29tLmJyL3Jlc291cmNlcyIsImxrcF9hcGlwb3J0YWwiLCJsa3BfZGlzdHJpYnV0aW9uIiwibGtwaWQ0Il0sImNsaWVudF9pZCI6ImxrcF9kZXZlbG9wZXJfcG9ydGFsXzEiLCJzdWIiOiI2OTY5ZDA3Ni0yOWNhLTQyMjEtOTdkZC0yM2QyYWE2Y2QyMmUiLCJhdXRoX3RpbWUiOjE2NTcyOTE3ODAsImlkcCI6ImxvY2FsIiwiZ2l2ZW5fbmFtZSI6Ik1hdGhldXMiLCJtaWRkbGVfbmFtZSI6IktpZWxrb3dza2kiLCJuaWNrbmFtZSI6Ik1hdGhldXMiLCJwaWN0dXJlIjoicGljdHVyZSIsIm9mZmljZSI6IiIsImV4dGVybmFsaWQiOiI1YTBlMTY4OWY4ODQzODE1ZjRmNWU5YzkiLCJleHRlcm5hbHR5cGUiOiJzZWxsZXIiLCJyb2xlIjoibGtwLmJ1c2luZXNzIiwibmFtZSI6Im1hdGhldXMua2llbGtvd3NraUBsaW5rYXBpLmNvbS5iciIsImVtYWlsIjoibWF0aGV1cy5raWVsa293c2tpQGxpbmthcGkuY29tLmJyIiwic2NvcGUiOlsiZW1haWwiLCJsa3BkZWZhdWx0Iiwib3BlbmlkIiwicHJvZmlsZSIsImxrcF9hcGlwb3J0YWwiLCJsa3BfZGlzdC5yZWFkIiwibGtwX2Rpc3Qud3JpdGUiLCJsa3BpZDQucmVhZCIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.cMcWxmLo6yJADdSYHVmRRSxi2MTGEiLJtrpPFKdsvYTGMSU9F3oJWeN4n0wAsWVTKZCjcCewcDFlZphOeXaA9aabK0xDLju9RJJPSlGBkXTHDYughWoLRFzQLtSGAktmHFbzC5j5klb-QPlHkF-xOrvn_EP-LlijWmfKsYY-v-HCMF2Nw9NEu__eNPy0bEnAHoMQPvUKuUs2TsmbWoZdJzg2KzUQrTKI0mWexBc_QQ_WdJgbkxuCdVoisRyhO853H9UF_779FBBiGTQ_ELzthn81z2FWI1SvB8NNC8ZtfSLF_cQfDQqghBpqNWSe2-gPiu_xV3ewooLB-j5gUbKD_A`
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

        const groupedIntegrationsByTenant = lodash.groupBy(
            activeIntegrations, integration => integration.tenant
        );

        const groupedIntegrationsByTenantAndProject = [];

        for (const tenant of Object.keys(groupedIntegrationsByTenant)) {
            groupedIntegrationsByTenantAndProject.push({
                tenant,
                projects: lodash.groupBy(
                    groupedIntegrationsByTenant[tenant], integration => integration.project_name
                )
            });
        }

        if (fs.existsSync('./report.json')) {
            fs.unlinkSync()
        }

        fs.writeFile(
            "report.json",
            JSON.stringify({ SamsungActiveProjectsReport: groupedIntegrationsByTenantAndProject }),
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
