import type { Dependencies } from './config';
import { getConfig } from './get-config';

export async function getDependencies(): Promise<Dependencies> {
  const config = await getConfig();
  return [];
}
