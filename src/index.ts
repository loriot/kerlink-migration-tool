import { loadChirpstackApplications } from './chirpstack/applications';
import { loadChirpstackGateways } from './chirpstack/gateways';
import { loadKerlinkClusters } from './kerlink/clusters';
import { loadKerlinkFleets } from './kerlink/fleets';
import { LoriotApplication, importApplications } from './loriot/applications';
import { LoriotNetwork, importNetworks } from './loriot/networks';

(async () => {
  console.log(`LORIOT Migration Tool v${require('../package.json').version}`);
  console.log(``);

  try {
    // (1) LOAD RESOURCES
    var applications: LoriotApplication[] = [];
    var networks: LoriotNetwork[] = [];
    if (
      process.env.CHIRPSTACK_URL &&
      process.env.CHIRPSTACK_API_TOKEN &&
      process.env.CHIRPSTACK_TENANT_ID
    ) {
      // Load ChirpStack applications, integrations and devices
      applications = await loadChirpstackApplications(
        process.env.CHIRPSTACK_URL,
        process.env.CHIRPSTACK_API_TOKEN,
        process.env.CHIRPSTACK_TENANT_ID
      );
      // Load ChirpStack networks and gateways
      networks = [
        await loadChirpstackGateways(
          process.env.CHIRPSTACK_URL,
          process.env.CHIRPSTACK_API_TOKEN,
          process.env.CHIRPSTACK_TENANT_ID
        ),
      ];
    } else {
      // Load Kerlink clusters, push configurations and devices
      applications = await loadKerlinkClusters();
      // Load Kerlink networks and gateways
      networks = await loadKerlinkFleets();
    }

    // (3) IMPORT RESOURCES TO LORIOT
    if (process.env.IMPORT !== undefined ? Number(process.env.IMPORT) : true) {
      if (applications.length > 0) {
        // Import applications, outputs and devices
        await importApplications(applications);
      }
      if (networks.length > 0) {
        // Import networks and gateways
        await importNetworks(networks);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
