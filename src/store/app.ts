// Utilities
import { defineStore } from 'pinia';
import { version } from '../../package.json';
import { UniversalVersion } from "../../package.json";
interface AppState {
  endpoint_tag: any;
  packageVersion: string;
  packageunivVerison: string;
  is_login: boolean;
  update_current_router_path: string,
}
export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    endpoint_tag: null,
    packageVersion: version,
    packageunivVerison: UniversalVersion,
    is_login: false,
    update_current_router_path: ''
  }),
})