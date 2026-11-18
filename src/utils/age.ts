/** Menghitung usia (tahun) dari tanggal lahir format YYYY-MM-DD. */
export function calculateAge(dateOfBirth: string, today = new Date()): number {
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(0, age);
}

export function formatAge(dateOfBirth: string): string {
  const years = calculateAge(dateOfBirth);
  return years === 0 ? '< 1 tahun' : `${years} tahun`;
}
