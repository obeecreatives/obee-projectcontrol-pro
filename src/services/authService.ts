import { StaffUser, SecurityLogItem, DefaultPasswordConfig, UserRole } from '../types';
import { FULL_ACCESS_EMAILS } from '../data/seedData';

const KEY_AUTH_USER = 'pcs_auth_user_v1';
const KEY_STAFF_DIRECTORY = 'pcs_staff_directory_v1';
const KEY_STAFF_PINS = 'pcs_staff_pins_v1';
const KEY_DEFAULT_PASSWORDS = 'pcs_default_passwords_v1';
const KEY_SECURITY_LOGS = 'pcs_security_logs_v1';

export const DEVELOPER_STANDARD_DEFAULT_PASSWORDS: DefaultPasswordConfig = {
  adminDefault: '8888',
  staffDefault: '1234',
  updatedAt: '2026-01-01',
  updatedBy: 'obeetools@gmail.com',
};

export const INITIAL_STAFF_DIRECTORY: StaffUser[] = [
  {
    id: 'STF-1785303827045',
    name: 'Lalu Mahendra Ali Akbar',
    email: 'loehendra@gmail.com',
    divisi: 'Photography / Manajemen',
    jabatan: 'CEO & Project Manager',
    role: 'project_manager',
    phone: '081335125277',
    statusKerja: 'Aktif - Karyawan Tetap',
    baseRate: 50000,
    isAdmin: true,
    createdAt: '2026-07-29',
    instagram: '@lalumahendra',
    alamat: 'Jl. Batok 8 Kelurahan Sisir',
    gradeSkill: 'Leader',
  },
  {
    id: 'STF-DEV-1',
    name: 'Web Developer (obeetools)',
    email: 'obeetools@gmail.com',
    divisi: 'Teknologi',
    jabatan: 'Lead Web Developer',
    role: 'web_developer',
    phone: '081987654321',
    statusKerja: 'Aktif',
    baseRate: 50000,
    namaBank: 'Mandiri',
    noRekening: '1410012345678',
    isAdmin: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'STF-DEV-2',
    name: 'Web Developer (obeecreatives)',
    email: 'obeecreatives@gmail.com',
    divisi: 'Teknologi',
    jabatan: 'Principal Web Developer',
    role: 'web_developer',
    phone: '081987654322',
    statusKerja: 'Aktif',
    baseRate: 50000,
    namaBank: 'BCA',
    noRekening: '0569988776',
    isAdmin: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'STF-ADMIN-1',
    name: 'Admin Operasional',
    email: 'admin@obeecreatives.com',
    divisi: 'Manajemen',
    jabatan: 'Operational Admin & Approval Reviewer',
    role: 'admin',
    phone: '081234888999',
    statusKerja: 'Aktif',
    baseRate: 40000,
    namaBank: 'BCA',
    noRekening: '0562233445',
    isAdmin: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'STF-1785295519572',
    name: 'Adissa Rifdah Aulia',
    email: 'dissaraulia@gmail.com',
    divisi: 'Social Media Management',
    jabatan: 'Content Strategic',
    role: 'staff_creator',
    phone: '081358855561',
    statusKerja: 'Aktif - PKWT',
    baseRate: 35000,
    namaBank: 'Bank Jago',
    noRekening: '105180543278',
    isAdmin: false,
    createdAt: '2026-07-29',
    instagram: '@adissaulia',
    alamat: 'Jl. Albatros, No. 3, Kec. Bumiaji, Kota Batu',
    gradeSkill: 'Junior Creative',
    gajiPokok: 'Rp 1.000.000',
    tunjJabatan: 'Rp 300.000',
    catatan: 'Rekening Bank Jago a/c 105180543278',
  },
  {
    id: 'STF-1785307520278',
    name: 'Aldrien Andriansyah',
    email: 'aldrien.and@gmail.com',
    divisi: 'Videography',
    jabatan: 'Staff Video Creator',
    role: 'staff_creator',
    phone: '085930990792',
    statusKerja: 'Aktif - PKWT',
    baseRate: 40000,
    namaBank: 'BNI',
    noRekening: '2052442241',
    isAdmin: false,
    createdAt: '2026-07-29',
    instagram: '@aldrn.andrnsyh',
    alamat: 'Jl. Menur 3/39 Surabaya',
    gradeSkill: 'Creative Trainee (C)',
    gajiPokok: 800000,
    tunjJabatan: 'Rp 200.000',
    catatan: 'Bank BNI a/c 2052442241',
  },
  {
    id: 'STF-1790218381197',
    name: 'Febrina Putri K',
    email: 'putrikriswardani@gmail.com',
    divisi: 'Desain Grafis',
    jabatan: 'Desain Grafis',
    role: 'staff_creator',
    phone: '081230673226',
    statusKerja: 'Aktif - Magang',
    baseRate: 30000,
    namaBank: 'BCA',
    isAdmin: false,
    createdAt: '2026-09-24',
    alamat: 'Jl. Durian 11 Rt02, Rw02, Songgoriti Kota Batu',
  },
  {
    id: 'STF-1785374645853',
    name: 'Vita Belfi',
    email: 'vitabelfi@gmail.com',
    divisi: 'Social Media Management',
    jabatan: 'Creative Staff',
    role: 'staff_creator',
    phone: '081252622176',
    statusKerja: 'Aktif - Karyawan Tetap',
    baseRate: 30000,
    namaBank: 'BCA',
    noRekening: '0190717623',
    isAdmin: false,
    createdAt: '2026-07-30',
    catatan: 'Bank BCA a/c 0190717623',
  },
  {
    id: 'STF-1785300550339',
    name: 'Muhammad Labib Azka',
    email: 'labibmuhammad157@gmail.com',
    divisi: 'Desain Grafis',
    jabatan: 'Desainer Grafis',
    role: 'staff_creator',
    phone: '089513813532',
    statusKerja: 'Nonaktif',
    baseRate: 30000,
    namaBank: 'BCA',
    isAdmin: false,
    createdAt: '2026-07-29',
    instagram: '@azka_iniyah',
    alamat: 'Dadaprejo, Kec. Junrejo, Kota Batu, Jawa Timur 65233',
    gradeSkill: 'Creative Trainee (C)',
    gajiPokok: 600000,
  },
  {
    id: 'STF-1788690149337',
    name: 'Baiq Ayesha',
    email: 'feedkreatif@gmail.com',
    divisi: 'Videography',
    jabatan: 'Video Editor',
    role: 'staff_creator',
    phone: '081217360976',
    statusKerja: 'Nonaktif',
    baseRate: 30000,
    isAdmin: false,
    createdAt: '2026-09-06',
    alamat: 'Batu',
    gradeSkill: 'Pemula',
    catatan: 'Direkrut via Recruitment Obeecreatives. Skor: 82/100',
  },
];

class AuthService {
  getDirectory(): StaffUser[] {
    try {
      const raw = localStorage.getItem(KEY_STAFF_DIRECTORY);
      if (!raw) {
        this.setDirectory(INITIAL_STAFF_DIRECTORY);
        return INITIAL_STAFF_DIRECTORY;
      }
      const list: StaffUser[] = JSON.parse(raw);
      // Synchronize key full access accounts
      let updated = false;
      INITIAL_STAFF_DIRECTORY.forEach((initUser) => {
        const found = list.find(
          (u) =>
            u.email.toLowerCase() === initUser.email.toLowerCase() ||
            (initUser.email === 'putrikriswardani@gmail.com' && u.email === 'febrina.putri@gmail.com')
        );
        if (!found) {
          list.push(initUser);
          updated = true;
        } else {
          // Sync ID, bank, and contact info if missing
          if (!found.id.startsWith('STF-1') && initUser.id.startsWith('STF-1')) {
            found.id = initUser.id;
            updated = true;
          }
          if (initUser.namaBank && !found.namaBank) {
            found.namaBank = initUser.namaBank;
            found.noRekening = initUser.noRekening;
            updated = true;
          }
          if (initUser.statusKerja && found.statusKerja !== initUser.statusKerja) {
            found.statusKerja = initUser.statusKerja;
            updated = true;
          }
          if (found.email === 'febrina.putri@gmail.com' && initUser.email === 'putrikriswardani@gmail.com') {
            found.email = 'putrikriswardani@gmail.com';
            updated = true;
          }
          // ensure loehendra, obeetools, and obeecreatives have correct roles
          if (['loehendra@gmail.com', 'obeetools@gmail.com', 'obeecreatives@gmail.com'].includes(found.email.toLowerCase())) {
            if (found.role !== initUser.role || !found.isAdmin) {
              found.role = initUser.role;
              found.isAdmin = true;
              updated = true;
            }
          }
        }
      });
      if (updated) {
        this.setDirectory(list);
      }
      return list;
    } catch {
      return INITIAL_STAFF_DIRECTORY;
    }
  }

  setDirectory(list: StaffUser[]) {
    localStorage.setItem(KEY_STAFF_DIRECTORY, JSON.stringify(list));
  }

  getCurrentUser(): StaffUser | null {
    try {
      const raw = localStorage.getItem(KEY_AUTH_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: StaffUser | null) {
    if (user) {
      localStorage.setItem(KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEY_AUTH_USER);
    }
  }

  // Default Passwords (Developer Standard & Custom)
  getDefaultPasswordConfig(): DefaultPasswordConfig {
    try {
      const raw = localStorage.getItem(KEY_DEFAULT_PASSWORDS);
      if (!raw) {
        this.saveDefaultPasswordConfig(DEVELOPER_STANDARD_DEFAULT_PASSWORDS);
        return DEVELOPER_STANDARD_DEFAULT_PASSWORDS;
      }
      return JSON.parse(raw);
    } catch {
      return DEVELOPER_STANDARD_DEFAULT_PASSWORDS;
    }
  }

  saveDefaultPasswordConfig(config: DefaultPasswordConfig) {
    localStorage.setItem(KEY_DEFAULT_PASSWORDS, JSON.stringify(config));
  }

  updateDefaultPasswordConfig(
    partial: Partial<DefaultPasswordConfig>,
    actorEmail: string = 'system'
  ): { success: boolean; config: DefaultPasswordConfig } {
    const current = this.getDefaultPasswordConfig();
    const updated: DefaultPasswordConfig = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail,
    };
    this.saveDefaultPasswordConfig(updated);

    this.addSecurityLog({
      action: 'DEFAULT_PASSWORD_UPDATE',
      actorEmail,
      details: `Password default diperbarui: Admin/Kurator="${updated.adminDefault}", Staf="${updated.staffDefault}"`,
    });

    return { success: true, config: updated };
  }

  resetToDeveloperStandardPasswords(actorEmail: string = 'system'): DefaultPasswordConfig {
    const std = {
      ...DEVELOPER_STANDARD_DEFAULT_PASSWORDS,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail,
    };
    this.saveDefaultPasswordConfig(std);
    this.addSecurityLog({
      action: 'DEFAULT_PASSWORD_UPDATE',
      actorEmail,
      details: `Reset password standar developer kembali ke default (Admin: 8888, Staf: 1234)`,
    });
    return std;
  }

  getDefaultPasswordForRole(role: UserRole | string, isAdmin: boolean = false): string {
    const config = this.getDefaultPasswordConfig();
    if (
      isAdmin ||
      role === 'project_manager' ||
      role === 'web_developer' ||
      role === 'admin' ||
      role === 'site_engineer'
    ) {
      return config.adminDefault || '8888';
    }
    return config.staffDefault || '1234';
  }

  // Security Audit Logs
  getSecurityLogs(): SecurityLogItem[] {
    try {
      const raw = localStorage.getItem(KEY_SECURITY_LOGS);
      if (!raw) {
        const initialLogs: SecurityLogItem[] = [
          {
            id: 'sec-init-1',
            timestamp: '2026-01-01T00:00:00.000Z',
            action: 'DEFAULT_PASSWORD_UPDATE',
            actorEmail: 'obeetools@gmail.com',
            details: 'Sistem keamanan 2 lapis aktif. Password standar developer: 8888 (Admin) & 1234 (Staf)',
          },
          {
            id: 'sec-init-2',
            timestamp: '2026-01-01T08:00:00.000Z',
            action: 'WHITELIST_ADD',
            actorEmail: 'obeetools@gmail.com',
            targetEmail: 'loehendra@gmail.com',
            details: 'Inisialisasi akun Super Admin / PM Lalu Mahendra dengan Full Access',
          },
        ];
        this.saveSecurityLogs(initialLogs);
        return initialLogs;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveSecurityLogs(logs: SecurityLogItem[]) {
    localStorage.setItem(KEY_SECURITY_LOGS, JSON.stringify(logs.slice(0, 100)));
  }

  addSecurityLog(entry: Omit<SecurityLogItem, 'id' | 'timestamp'>) {
    const logs = this.getSecurityLogs();
    const newLog: SecurityLogItem = {
      id: 'sec-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    logs.unshift(newLog);
    this.saveSecurityLogs(logs);
  }

  // Whitelist Verification
  isEmailWhitelisted(email: string): boolean {
    const clean = email.toLowerCase().trim();
    return this.getDirectory().some((u) => u.email.toLowerCase().trim() === clean);
  }

  getStaffPin(email: string): string {
    const pinsMap = this.getAllPins();
    const cleanEmail = email.toLowerCase().trim();
    if (pinsMap[cleanEmail]) return pinsMap[cleanEmail];

    const user = this.getDirectory().find((s) => s.email.toLowerCase() === cleanEmail);
    return this.getDefaultPasswordForRole(user?.role || 'staff_creator', !!user?.isAdmin);
  }

  getAllPins(): Record<string, string> {
    try {
      const raw = localStorage.getItem(KEY_STAFF_PINS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  setStaffPin(email: string, newPin: string) {
    const pins = this.getAllPins();
    pins[email.toLowerCase().trim()] = newPin.trim();
    localStorage.setItem(KEY_STAFF_PINS, JSON.stringify(pins));
  }

  loginWithPin(email: string, pin: string): { success: boolean; user?: StaffUser; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const dir = this.getDirectory();
    const user = dir.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: 'Email akun staf tidak ditemukan di Whitelist Sistem. Hubungi PM atau Web Developer.',
      };
    }

    const correctPin = this.getStaffPin(cleanEmail);
    if (pin.trim() !== correctPin.trim()) {
      return {
        success: false,
        error: 'Password / PIN keamanan salah. Silakan coba lagi atau minta reset ke PM / Admin.',
      };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  // Self-service password change
  changePin(email: string, oldPin: string, newPin: string): { success: boolean; error?: string } {
    const currentPin = this.getStaffPin(email);
    if (oldPin.trim() !== currentPin.trim()) {
      return { success: false, error: 'Password / PIN lama yang Anda masukkan tidak sesuai.' };
    }
    if (newPin.trim().length < 4) {
      return { success: false, error: 'Password / PIN baru minimal terdiri dari 4 karakter/digit.' };
    }

    this.setStaffPin(email, newPin.trim());
    this.addSecurityLog({
      action: 'PASSWORD_CHANGE',
      actorEmail: email,
      targetEmail: email,
      details: 'Pengguna melakukan ganti password / PIN mandiri dengan sukses.',
    });

    return { success: true };
  }

  // Admin / Dev reset password for target user
  adminResetPin(adminEmail: string, targetStaffEmail: string, newPin?: string): { success: boolean; newPassword?: string; error?: string } {
    const dir = this.getDirectory();
    const admin = dir.find((s) => s.email.toLowerCase() === adminEmail.toLowerCase());
    const isFullAccess = FULL_ACCESS_EMAILS.includes(adminEmail.toLowerCase());

    if (!admin?.isAdmin && !isFullAccess) {
      return { success: false, error: 'Hanya Admin, Web Developer, atau Site Engineer yang dapat mereset password akun staf.' };
    }

    const targetUser = dir.find((s) => s.email.toLowerCase() === targetStaffEmail.toLowerCase());
    if (!targetUser) {
      return { success: false, error: 'Akun target tidak ditemukan di Whitelist.' };
    }

    // If newPin is not provided, reset to current default password for that role
    const finalPassword = newPin?.trim() || this.getDefaultPasswordForRole(targetUser.role, targetUser.isAdmin);
    this.setStaffPin(targetStaffEmail, finalPassword);

    this.addSecurityLog({
      action: 'PASSWORD_RESET',
      actorEmail: adminEmail,
      targetEmail: targetStaffEmail,
      details: `Password di-reset ke: "${finalPassword}" oleh ${adminEmail}`,
    });

    return { success: true, newPassword: finalPassword };
  }

  // Update staff role directly from Role Access Settings
  updateUserRole(
    email: string,
    newRole: UserRole,
    actorEmail: string = 'Admin'
  ): { success: boolean; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const list = this.getDirectory();
    const target = list.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!target) {
      return { success: false, error: 'User tidak ditemukan di direktori staf.' };
    }

    const oldRole = target.role;
    target.role = newRole;
    target.isAdmin = ['project_manager', 'web_developer', 'admin', 'site_engineer'].includes(newRole);

    this.setDirectory(list);

    // If current logged in user is this person, update currentUser session
    const cur = this.getCurrentUser();
    if (cur && cur.email.toLowerCase() === cleanEmail) {
      this.setCurrentUser(target);
    }

    this.addSecurityLog({
      action: 'ROLE_UPDATE',
      actorEmail,
      targetEmail: cleanEmail,
      details: `Mengubah hak akses peran dari "${oldRole}" menjadi "${newRole}"`,
    });

    return { success: true };
  }

  // Register user into whitelist with automatic default password
  registerWhitelistUser(
    newStaff: StaffUser,
    customInitialPassword?: string,
    actorEmail: string = 'system'
  ): { success: boolean; initialPassword?: string; error?: string } {
    const dir = this.getDirectory();
    const cleanEmail = newStaff.email.toLowerCase().trim();

    if (dir.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Akun dengan email tersebut sudah terdaftar di Whitelist.' };
    }

    // Determine initial password (custom or default for role)
    const initialPassword = customInitialPassword?.trim() || this.getDefaultPasswordForRole(newStaff.role, newStaff.isAdmin);

    const completeStaff: StaffUser = {
      ...newStaff,
      email: cleanEmail,
      createdAt: newStaff.createdAt || new Date().toISOString().split('T')[0],
    };

    dir.push(completeStaff);
    this.setDirectory(dir);
    this.setStaffPin(cleanEmail, initialPassword);

    this.addSecurityLog({
      action: 'WHITELIST_ADD',
      actorEmail,
      targetEmail: cleanEmail,
      details: `Pendaftaran Whitelist baru: ${completeStaff.name} (${completeStaff.role}) dengan password awal: "${initialPassword}"`,
    });

    return { success: true, initialPassword };
  }

  // Legacy wrapper for registerNewStaff
  registerNewStaff(newStaff: StaffUser): { success: boolean; error?: string } {
    const res = this.registerWhitelistUser(newStaff);
    return { success: res.success, error: res.error };
  }

  // Remove from Whitelist with protection for Super Admin and Devs
  removeWhitelistUser(email: string, actorEmail: string = 'system'): { success: boolean; error?: string } {
    const cleanEmail = email.toLowerCase().trim();

    if (FULL_ACCESS_EMAILS.includes(cleanEmail)) {
      return {
        success: false,
        error: `Akun "${cleanEmail}" adalah akun Super Admin / Web Developer utama dan tidak dapat dihapus dari Whitelist demi integritas sistem.`,
      };
    }

    const dir = this.getDirectory();
    const target = dir.find((s) => s.email.toLowerCase() === cleanEmail);
    if (!target) {
      return { success: false, error: 'Akun tidak ditemukan di Whitelist.' };
    }

    const updated = dir.filter((s) => s.email.toLowerCase() !== cleanEmail);
    this.setDirectory(updated);

    // Clean up PIN
    const pins = this.getAllPins();
    delete pins[cleanEmail];
    localStorage.setItem(KEY_STAFF_PINS, JSON.stringify(pins));

    this.addSecurityLog({
      action: 'WHITELIST_REMOVE',
      actorEmail,
      targetEmail: cleanEmail,
      details: `Akun ${target.name} (${cleanEmail}) dihapus dari Whitelist oleh ${actorEmail}`,
    });

    return { success: true };
  }

  deleteStaff(email: string): { success: boolean; error?: string } {
    return this.removeWhitelistUser(email, 'admin');
  }

  updateStaff(email: string, patch: Partial<StaffUser>): { success: boolean; error?: string } {
    const dir = this.getDirectory();
    const idx = dir.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { success: false, error: 'Staf tidak ditemukan.' };

    dir[idx] = { ...dir[idx], ...patch };
    this.setDirectory(dir);

    // If currently logged in user is updated
    const cur = this.getCurrentUser();
    if (cur && cur.email.toLowerCase() === email.toLowerCase()) {
      this.setCurrentUser(dir[idx]);
    }

    return { success: true };
  }

  logout() {
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
