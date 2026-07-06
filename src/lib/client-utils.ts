import type { Mandal, AreaOption } from "@/types/organization";

export function getStanaOptions(mandal: Mandal) {
  return mandal.stanas.map((s) => ({ id: s.id, name: s.name }));
}

export function getGramaOptionsForStana(mandal: Mandal, stanaId: string) {
  const stana = mandal.stanas.find((s) => s.id === stanaId);
  if (!stana) return [];
  return stana.gramas.map((g) => ({ id: g.id, name: g.name }));
}

export function getUpavathiOptionsForGrama(mandal: Mandal, stanaId: string, gramaId: string) {
  const stana = mandal.stanas.find((s) => s.id === stanaId);
  if (!stana) return [];
  const grama = stana.gramas.find((g) => g.id === gramaId);
  if (!grama) return [];
  return grama.upavathis.map((u) => ({ id: u.id, name: u.name }));
}

export function getAllAreaOptions(mandal: Mandal): AreaOption[] {
  const options: AreaOption[] = [];
  for (const stana of mandal.stanas) {
    for (const grama of stana.gramas) {
      for (const upavathi of grama.upavathis) {
        for (const area of upavathi.areas) {
          options.push({
            areaId: area.id,
            label: `${stana.name} › ${grama.name} › ${upavathi.name} › ${area.name}`,
          });
        }
      }
    }
  }
  return options;
}

export function flattenMembersFromMandal(mandal: Mandal) {
  const result = [];
  for (const stana of mandal.stanas) {
    for (const grama of stana.gramas) {
      for (const upavathi of grama.upavathis) {
        for (const area of upavathi.areas) {
          for (const member of area.members) {
            result.push({
              ...member,
              areaId: area.id,
              areaName: area.name,
              upavathiName: upavathi.name,
              gramaName: grama.name,
              stanaName: stana.name,
            });
          }
        }
      }
    }
  }
  return result;
}
