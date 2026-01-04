import dotenv from "dotenv";
dotenv.config();

import { loadConfig } from "./shared/config.js";
import { createPool } from "./shared/db/pool.js";
import { createApp } from "./app.js";

async function main() {
    const config = loadConfig();
    const pool = createPool(config);

    const app = createApp({ pool });

    app.listen(config.PORT, () => {
        console.log(`[HTTP] Server listening on port ${config.PORT}`);
    });
}

main().catch((err) => {
    console.error("Fatal error during startup");
    console.error(err);
    process.exit(1);
});
