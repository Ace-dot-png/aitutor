// Shared in-memory user store for demo mode
// In production, replace with Prisma/PostgreSQL queries

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  schoolId?: string;
  schoolName?: string;
  grade?: string;
  pin?: string;
  curriculum?: string;
  linkedStudentId?: string;
  language?: string;
  parentEmail?: string;
}

const users: Record<string, StoredUser> = {
  "admin@sandtonacademy.co.za": { id: "a1", email: "admin@sandtonacademy.co.za", name: "Mr. David Sithole", password: "Admin123!", role: "ADMIN", schoolId: "s1", schoolName: "Sandton Academy", language: "en" },
  "n.dlamini@sandtonacademy.co.za": { id: "t1", email: "n.dlamini@sandtonacademy.co.za", name: "Ms. Nomsa Dlamini", password: "Teacher123!", role: "TEACHER", schoolId: "s1", schoolName: "Sandton Academy", language: "en" },
  "thabo@student.co.za": { id: "s1", email: "thabo@student.co.za", name: "Thabo Nkosi", password: "Student123!", role: "STUDENT", schoolId: "s1", schoolName: "Sandton Academy", grade: "G10", pin: "482910", language: "en" },
  "maryke.daughter@aitutor.co.za": { id: "sc1", email: "maryke.daughter@aitutor.co.za", name: "Maryke se dogter", password: "Demo2025!", role: "STUDENT", schoolId: "s1", schoolName: "Sandton Academy", grade: "G10", pin: "629104", language: "en" },
  "maryke@aitutor.co.za": { id: "pc1", email: "maryke@aitutor.co.za", name: "Maryke", password: "Demo2025!", role: "PARENT", linkedStudentId: "sc1", language: "en" },
  "priya@patel.co.za": { id: "p1", email: "priya@patel.co.za", name: "Mrs. Priya Patel", password: "Parent123!", role: "PARENT", language: "en" },
  "newparent@test.co.za": { id: "p99", email: "newparent@test.co.za", name: "Test Parent", password: "Parent123!", role: "PARENT", language: "en" },
  "maryke@testing.com": { id: "nt1", email: "maryke@testing.com", name: "Maryke", password: "Demo2026!", role: "PARENT", linkedStudentId: "ns1", language: "en" },
  "klara@testing.com": { id: "ns1", email: "klara@testing.com", name: "Klara", password: "Demo2026!", role: "STUDENT", schoolId: "s1", schoolName: "Sandton Academy", grade: "G10", pin: "847362", language: "en" },
  "admin@testing.com": { id: "na1", email: "admin@testing.com", name: "Admin", password: "Demo2026!", role: "ADMIN", schoolId: "s1", schoolName: "Sandton Academy", language: "en" },
};

export function findUser(email: string, password: string): Omit<StoredUser, "password"> | null {
  const key = email.toLowerCase().trim();
  const user = users[key];
  if (!user || user.password !== password) return null;
  const { password: _, ...safe } = user;
  return safe;
}

export function getAllUsers(): StoredUser[] {
  return Object.values(users);
}

export function addUser(user: StoredUser): void {
  users[user.email.toLowerCase().trim()] = user;
}

export function deleteUser(email: string): boolean {
  const key = email.toLowerCase().trim();
  if (users[key]) {
    delete users[key];
    return true;
  }
  return false;
}

export function updateUser(email: string, updates: Partial<StoredUser>): StoredUser | null {
  const key = email.toLowerCase().trim();
  if (!users[key]) return null;
  users[key] = { ...users[key], ...updates, email: key };
  return users[key];
}

export function resetPassword(email: string, newPassword: string): boolean {
  const key = email.toLowerCase().trim();
  if (!users[key]) return false;
  users[key].password = newPassword;
  return true;
}

// School management
const schools: string[] = [
  "Sandton Academy",
  "Parktown High School",
  "St Mary's School",
  "Home Schooled",
];

export function getSchools(): string[] {
  return [...schools];
}

export function addSchool(name: string): void {
  const trimmed = name.trim();
  if (trimmed && !schools.includes(trimmed)) {
    schools.push(trimmed);
  }
}

export function importSchoolsCSV(csvText: string): number {
  const names = csvText
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 1);
  let added = 0;
  for (const name of names) {
    if (!schools.includes(name)) {
      schools.push(name);
      added++;
    }
  }
  return added;
}
