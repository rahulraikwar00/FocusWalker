// ###############################################
// STORAGE SECTION
// ###############################################

import localforage from "localforage";
import {
  MissionState,
  CheckPointData,
} from "@/features/mission/contexts/MissionContext";

// Metadata: Mission stats, status, and IDs (Lightweight)
const metaStore = localforage.createInstance({
  name: "FocusWalker",
  storeName: "mission_metadata",
});

// Heavy: Checkpoints, Photos, and GeoJSON (Heavyweight)
const logStore = localforage.createInstance({
  name: "FocusWalker",
  storeName: "mission_logs",
});

export const StorageService = {
  /** 1. MISSION METADATA (Sidebar/List View) **/

  async saveMission(mission: MissionState) {
    // Destructure to ensure we don't accidentally save logs in the metadata bucket
    const { ...metadata } = mission;
    return await metaStore.setItem(mission.currentMissionId, metadata);
  },

  async getAllMissions() {
    const list: MissionState[] = [];
    await metaStore.iterate((value: MissionState) => {
      list.push(value);
    });
    // Sort by timestamp here so the UI doesn't have to
    return list.sort((a, b) => b.timeStamp.localeCompare(a.timeStamp));
  },

  async updateMission(id: string, updates: Partial<MissionState>) {
    const existing = (await metaStore.getItem<MissionState>(id)) || {};
    return await metaStore.setItem(id, { ...existing, ...updates });
  },

  /** 2. MISSION LOGS (Heavy Data) **/

  async saveCheckpoints(missionId: string, logs: CheckPointData[]) {
    return await logStore.setItem(missionId, logs);
  },

  async addSingleCheckpoint(missionId: string, log: CheckPointData) {
    const logs = (await logStore.getItem<CheckPointData[]>(missionId)) ?? [];
    logs.push(log);
    return await logStore.setItem(missionId, logs);
  },

  /** 3. AGGREGATION & CLEANUP **/
  async getFullMission(id: string): Promise<DetailedMission | null> {
    const metadata = await metaStore.getItem<MissionState>(id);
    if (!metadata) return null;

    const logs = (await logStore.getItem<CheckPointData[]>(id)) ?? [];

    return {
      ...metadata,
      checkPoints: logs, // TypeScript is now happy because it expects CheckPointData[]
    };
  },
  async getActiveMission(): Promise<MissionState | null> {
    let activeMission: MissionState | null = null;

    await metaStore.iterate((value: MissionState) => {
      if (
        value.missionStatus === "active" ||
        value.missionStatus === "paused"
      ) {
        activeMission = value;
        return value; // Stop iterating once found
      }
    });

    return activeMission;
  },

  async deleteMission(id: string) {
    await metaStore.removeItem(id);
    // await logStore.removeItem(id);
    return true;
  },
};

export type DetailedMission = Omit<MissionState, "checkPoints"> & {
  checkPoints: CheckPointData[];
};

export function saveMissionStatesToStorage(missionstatet: MissionState) {
  StorageService.saveMission(missionstatet);
  console.log("saving curretn state to mission");
}

export function loadMissionStatesfromStorage() {
  const missionStates = StorageService.getActiveMission();
  console.log("loading mission from Storeage ");
  return missionStates;
}
