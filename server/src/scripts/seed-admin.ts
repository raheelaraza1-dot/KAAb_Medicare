import bcrypt from 'bcryptjs'
import { Admin } from '../models'
import { connectDatabase, config, disconnectDatabase } from '../config'
async function run(){if(!config.adminPassword)throw new Error('ADMIN_PASSWORD is required');await connectDatabase();await Admin.findOneAndUpdate({email:config.adminEmail},{email:config.adminEmail,passwordHash:await bcrypt.hash(config.adminPassword,12)},{upsert:true});await disconnectDatabase();console.log('Admin seeded')}run().catch(e=>{console.error(e);process.exit(1)})
