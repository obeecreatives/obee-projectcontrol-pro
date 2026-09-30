import { WorkMode, LocationSnapshot } from '../types';

export interface StaffPresenceItem {
  email: string;
  name: string;
  mode: WorkMode;
  locationName: string;
  distanceKm?: number;
  updatedAt: string;
}

export const DEFAULT_STUDIO_COORDS = {
  lat: -8.5833, // Kota Mataram, NTB
  lng: 116.1167,
  radiusKm: 0.25, // 250 meter radius
};

const KEY_WORK_MODE = 'pcs_work_mode';
const KEY_PLACE_TAG = 'pcs_place_tag';
const KEY_TEAM_PRESENCE = 'pcs_team_presence_v1';

export const INITIAL_TEAM_PRESENCE: StaffPresenceItem[] = [
  {
    email: 'loehendra@gmail.com',
    name: 'Lalu Mahendra Ali Akbar',
    mode: 'WFO',
    locationName: 'Studio obeecreatives Mataram',
    distanceKm: 0.05,
    updatedAt: new Date().toISOString(),
  },
  {
    email: 'dissaraulia@gmail.com',
    name: 'Adissa Rifdah Aulia',
    mode: 'WFO',
    locationName: 'Studio obeecreatives Mataram',
    distanceKm: 0.1,
    updatedAt: new Date().toISOString(),
  },
  {
    email: 'aldrien.and@gmail.com',
    name: 'Aldrien Andriansyah',
    mode: 'ON_SITE',
    locationName: 'Outlet KERIPIK SAYUR ID Mataram',
    distanceKm: 3.4,
    updatedAt: new Date().toISOString(),
  },
  {
    email: 'labibmuhammad157@gmail.com',
    name: 'Muhammad Labib Azka',
    mode: 'WFH',
    locationName: 'Kediaman Rumah (Mataram)',
    distanceKm: 5.1,
    updatedAt: new Date().toISOString(),
  },
  {
    email: 'febrina.putri@gmail.com',
    name: 'Febrina Putri K',
    mode: 'MOBILE',
    locationName: 'Kafe Kopi Kenangan Mataram',
    distanceKm: 1.8,
    updatedAt: new Date().toISOString(),
  },
];

class GeoService {
  getWorkMode(): WorkMode {
    return (localStorage.getItem(KEY_WORK_MODE) as WorkMode) || 'WFO';
  }

  getPlaceTag(): string {
    return localStorage.getItem(KEY_PLACE_TAG) || '';
  }

  formatModeLabel(mode: WorkMode): string {
    switch (mode) {
      case 'WFO':
        return 'Di Studio (WFO)';
      case 'ON_SITE':
        return 'On-Site Lapangan';
      case 'WFH':
        return 'WFH Remote';
      case 'MOBILE':
        return 'Mobile / Kafe';
    }
  }

  setWorkMode(mode: WorkMode, placeTag: string = '', userEmail?: string, userName?: string) {
    localStorage.setItem(KEY_WORK_MODE, mode);
    localStorage.setItem(KEY_PLACE_TAG, placeTag);

    if (userEmail && userName) {
      this.updateTeamMemberPresence(userEmail, userName, mode, placeTag);
    }
  }

  getTeamPresence(): StaffPresenceItem[] {
    try {
      const raw = localStorage.getItem(KEY_TEAM_PRESENCE);
      if (!raw) {
        this.saveTeamPresence(INITIAL_TEAM_PRESENCE);
        return INITIAL_TEAM_PRESENCE;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_TEAM_PRESENCE;
    }
  }

  saveTeamPresence(list: StaffPresenceItem[]) {
    localStorage.setItem(KEY_TEAM_PRESENCE, JSON.stringify(list));
  }

  updateTeamMemberPresence(email: string, name: string, mode: WorkMode, placeTag: string) {
    const list = this.getTeamPresence();
    const idx = list.findIndex((p) => p.email.toLowerCase() === email.toLowerCase());

    const locationName =
      mode === 'WFO'
        ? 'Studio obeecreatives Mataram'
        : placeTag.trim() ||
          (mode === 'ON_SITE' ? 'Lokasi Klien' : mode === 'WFH' ? 'Rumah (Remote)' : 'Kafe / Mobile');

    const item: StaffPresenceItem = {
      email,
      name,
      mode,
      locationName,
      distanceKm: mode === 'WFO' ? 0.05 : 3.5,
      updatedAt: new Date().toISOString(),
    };

    if (idx > -1) {
      list[idx] = item;
    } else {
      list.push(item);
    }

    this.saveTeamPresence(list);
  }

  removeTeamMember(email: string) {
    const list = this.getTeamPresence().filter((p) => p.email.toLowerCase() !== email.toLowerCase());
    this.saveTeamPresence(list);
  }

  resetToDefaultPresence() {
    this.saveTeamPresence(INITIAL_TEAM_PRESENCE);
  }

  createLocationSnapshot(): LocationSnapshot {
    const mode = this.getWorkMode();
    const tag = this.getPlaceTag();
    return {
      mode,
      label:
        mode === 'WFO'
          ? 'Studio obeecreatives'
          : tag
          ? tag
          : mode === 'ON_SITE'
          ? 'On-Site'
          : mode === 'WFH'
          ? 'WFH'
          : 'Mobile',
      placeTag: tag,
      timestamp: new Date().toISOString(),
      distanceKm: mode === 'WFO' ? 0.05 : undefined,
    };
  }

  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 100) / 100;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getBrowserPosition(timeoutMs: number = 5000): Promise<{ lat: number; lng: number } | null> {
    if (!navigator.geolocation) return null;
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), timeoutMs);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          clearTimeout(timer);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 }
      );
    });
  }
}

export const geoService = new GeoService();
