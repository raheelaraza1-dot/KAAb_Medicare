import { app } from './app'
import { connectDatabase, config, requireConfig } from './config'
async function start(){ requireConfig(); await connectDatabase(); app.listen(config.port,()=>console.log(`CAB Medicare API listening on ${config.port}`)) }
start().catch((error)=>{console.error(error);process.exit(1)})
