import { Storage } from '@google-cloud/storage';

import serviceAccount from './service_account.json';

export const credentials = serviceAccount;

const storage = new Storage({ credentials });
export default storage;

export const { FILES_DOMAIN = '' } = process.env;

export const filesBucket = storage.bucket(FILES_DOMAIN);
