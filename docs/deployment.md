# Azure Static Web Apps deployment

Public app: [किराना साथी](https://thankful-bay-05dfcb500.1.azurestaticapps.net)

| Setting | Value |
| --- | --- |
| Subscription | Azure subscription 1 (`75703df0-38f9-4e2e-8328-45f6fc810286`) |
| Resource group | `rg-kirana-saathi-demo` |
| Static Web App | `swa-kirana-saathi-demo` |
| Management location | East Asia (`eastasia`) |
| Pricing tier | Free |
| Production content | Vite's compiled `dist/` folder |
| Deployment tool | Official `@azure/static-web-apps-cli`, version `2.1.0` |

East Asia was selected from the locations reported by the subscription's `Microsoft.Web/staticSites` resource provider. The resource group and app are tagged `project=kirana-saathi-demo`, `purpose=synthetic-demo`, and `managedBy=codex`.

The app contains only synthetic public demo data, runs entirely in the browser, and uses localStorage per visitor. It needs no API, database, app credentials, or inventory service. Vite's relative asset paths work at the site's root. Navigation uses component state and a `#main` anchor, so no SPA route fallback configuration is required.

The published source baseline intentionally retains the sale-calculation defect described in the README. Sugar starts at **15 kg**; a **2 kg** sale displays **17 kg**, while the normal regression expects **13 kg**. Reset restores all eight seed products and an empty ledger. The “ऐप सहायता” link opens the companion support app at `http://127.0.0.1:4300` unless `VITE_SUPPORT_URL` is set before building.

## Repeat a production deployment

Run these commands from a checkout of the version you intend to publish. Use Node.js 22.12+ and npm, Azure CLI, Python 3, and an existing Azure CLI login with access to this Static Web App.

```sh
npm ci --ignore-scripts
npm run build
mkdir -p work/azure-tooling
npm install --prefix work/azure-tooling --no-audit --no-fund @azure/static-web-apps-cli@2.1.0
```

Install the CLI in the ignored tooling directory so it does not change the application's dependencies or lockfile. The following step retrieves the deployment credential into memory and passes it only through the deployment process's environment. It does not print the token or save it in the repository.

```sh
python3 - <<'PY'
import os
import pathlib
import subprocess

project = pathlib.Path.cwd()
subscription = '75703df0-38f9-4e2e-8328-45f6fc810286'
resource_group = 'rg-kirana-saathi-demo'
app_name = 'swa-kirana-saathi-demo'
token = subprocess.check_output([
    'az', 'staticwebapp', 'secrets', 'list',
    '--name', app_name, '--resource-group', resource_group,
    '--subscription', subscription,
    '--query', 'properties.apiKey', '-o', 'tsv', '--only-show-errors',
], text=True).strip()
if not token:
    raise SystemExit('Azure did not return a deployment credential.')
child_env = os.environ.copy()
child_env['SWA_CLI_DEPLOYMENT_TOKEN'] = token
try:
    subprocess.run([
        str(project / 'work/azure-tooling/node_modules/.bin/swa'),
        'deploy', str(project / 'dist'), '--env', 'production',
        '--no-use-keychain', '--app-name', app_name,
        '--resource-group', resource_group,
        '--subscription-id', subscription,
    ], env=child_env, check=True)
finally:
    child_env.pop('SWA_CLI_DEPLOYMENT_TOKEN', None)
    token = None
PY
```

Confirm the live Hindi page loads, then reset the sample and verify the expected behavior for the version you chose to deploy. There is no GitHub Actions deployment workflow or repository token integration. A GitHub push or draft repair PR does not change the public Azure app; publishing a new production build is a separate explicit action.

Microsoft documents this approach in [Deploy a static web app with Azure Static Web Apps CLI](https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-deploy). It supports publishing a prebuilt folder without an API and using `SWA_CLI_DEPLOYMENT_TOKEN` for authentication.
