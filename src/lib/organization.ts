import { promises as fs } from "fs";
import path from "path";
import type {
  Area,
  AreaInput,
  Grama,
  GramaInput,
  HierarchyPath,
  Mandal,
  Member,
  MemberInput,
  MemberUpdate,
  MemberWithPath,
  Stana,
  StanaInput,
  Upavathi,
  UpavathiInput,
  AreaOption,
} from "@/types/organization";

const DATA_FILE = path.join(process.cwd(), "data", "mandal.json");

function slugifyId(name: string, prefix: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeStana(raw: Record<string, unknown>): Stana {
  const id = (raw.id as string) || slugifyId("stana", "stana");
  const name = (raw.name as string) || "Mandala";

  if (Array.isArray(raw.gramas)) {
    return raw as unknown as Stana;
  }

  if (Array.isArray(raw.upavathis)) {
    return {
      id,
      name,
      gramas: [
        {
          id: `${id}-grama-main`,
          name: `${name.replace(/\s+Mandala$/i, "")} Grama`,
          upavathis: raw.upavathis as Upavathi[],
        },
      ],
    };
  }

  return { id, name, gramas: [] };
}

function migrateLegacyMandal(raw: Record<string, unknown>): Mandal {
  if (Array.isArray(raw.stanas)) {
    return {
      id: (raw.id as string) || "mandal",
      name: (raw.name as string) || "Taluku",
      stanas: (raw.stanas as Record<string, unknown>[]).map(normalizeStana),
    };
  }

  const upamandals = raw.upamandals as
    | { id: string; name: string; gramas: { id: string; name: string; shakhas: Area[] }[] }[]
    | undefined;

  return {
    id: (raw.id as string) || "mandal",
    name: (raw.name as string) || "Taluku",
    stanas: (upamandals || []).map((u) => ({
      id: u.id,
      name: u.name,
      gramas: (u.gramas || []).map((g) => ({
        id: g.id,
        name: g.name,
        upavathis: [
          {
            id: `${g.id}-upavathi`,
            name: `${g.name} Upavasathi`,
            areas: (g.shakhas || []).map((s) => ({
              id: s.id,
              name: s.name,
              members: s.members || [],
            })),
          },
        ],
      })),
    })),
  };
}

export async function getMandal(): Promise<Mandal> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return migrateLegacyMandal(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return { id: "empty", name: "Empty Taluku", stanas: [] };
  }
}

export async function saveMandal(mandal: Mandal): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(mandal, null, 2), "utf-8");
}

export function isWritableEnvironment(): boolean {
  return process.env.VERCEL !== "1";
}

export function findStana(mandal: Mandal, id: string): Stana | undefined {
  return mandal.stanas.find((s) => s.id === id);
}

export function findGrama(stana: Stana, id: string): Grama | undefined {
  return stana.gramas.find((g) => g.id === id);
}

export function findUpavathi(grama: Grama, id: string): Upavathi | undefined {
  return grama.upavathis.find((u) => u.id === id);
}

export function findArea(upavathi: Upavathi, id: string): Area | undefined {
  return upavathi.areas.find((a) => a.id === id);
}

export function findGramaInMandal(
  mandal: Mandal,
  stanaId: string,
  gramaId: string
): { stana: Stana; grama: Grama } | null {
  const stana = findStana(mandal, stanaId);
  if (!stana) return null;
  const grama = findGrama(stana, gramaId);
  if (!grama) return null;
  return { stana, grama };
}

export function findUpavathiInMandal(
  mandal: Mandal,
  stanaId: string,
  gramaId: string,
  upavathiId: string
): { stana: Stana; grama: Grama; upavathi: Upavathi } | null {
  const found = findGramaInMandal(mandal, stanaId, gramaId);
  if (!found) return null;
  const upavathi = findUpavathi(found.grama, upavathiId);
  if (!upavathi) return null;
  return { ...found, upavathi };
}

export function findAreaPath(mandal: Mandal, areaId: string): HierarchyPath | null {
  for (const stana of mandal.stanas) {
    for (const grama of stana.gramas) {
      for (const upavathi of grama.upavathis) {
        const area = upavathi.areas.find((a) => a.id === areaId);
        if (area) return { stana, grama, upavathi, area };
      }
    }
  }
  return null;
}

export function flattenMembers(mandal: Mandal): MemberWithPath[] {
  const result: MemberWithPath[] = [];
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

export function getMembersByArea(mandal: Mandal, areaId: string): MemberWithPath[] {
  const path = findAreaPath(mandal, areaId);
  if (!path?.area) return [];
  return path.area.members.map((m) => ({
    ...m,
    areaId: path.area!.id,
    areaName: path.area!.name,
    upavathiName: path.upavathi!.name,
    gramaName: path.grama!.name,
    stanaName: path.stana!.name,
  }));
}

export function getMembersByUpavathi(mandal: Mandal, upavathiId: string): MemberWithPath[] {
  const members: MemberWithPath[] = [];
  for (const stana of mandal.stanas) {
    for (const grama of stana.gramas) {
      const upavathi = grama.upavathis.find((u) => u.id === upavathiId);
      if (!upavathi) continue;
      for (const area of upavathi.areas) {
        for (const member of area.members) {
          members.push({
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
  return members;
}

export function getMembersByStana(mandal: Mandal, stanaId: string): MemberWithPath[] {
  const stana = findStana(mandal, stanaId);
  if (!stana) return [];
  const members: MemberWithPath[] = [];
  for (const grama of stana.gramas) {
    for (const upavathi of grama.upavathis) {
      for (const area of upavathi.areas) {
        for (const member of area.members) {
          members.push({
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
  return members;
}

export function countAreas(mandal: Mandal): number {
  return mandal.stanas.reduce(
    (acc, s) =>
      acc +
      s.gramas.reduce(
        (a, g) => a + g.upavathis.reduce((b, u) => b + u.areas.length, 0),
        0
      ),
    0
  );
}

export function countMembers(mandal: Mandal): number {
  return flattenMembers(mandal).length;
}

export async function addMember(input: MemberInput): Promise<MemberWithPath> {
  const mandal = await getMandal();
  const path = findAreaPath(mandal, input.areaId);
  if (!path?.area) throw new Error("Area not found");

  const member: Member = {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    role: input.role,
    address: input.address,
    joinedDate: input.joinedDate,
  };

  path.area.members.push(member);
  await saveMandal(mandal);

  return {
    ...member,
    areaId: path.area.id,
    areaName: path.area.name,
    upavathiName: path.upavathi!.name,
    gramaName: path.grama!.name,
    stanaName: path.stana!.name,
  };
}

export async function updateMember(
  memberId: string,
  update: MemberUpdate
): Promise<MemberWithPath | null> {
  const mandal = await getMandal();
  for (const stana of mandal.stanas) {
    for (const grama of stana.gramas) {
      for (const upavathi of grama.upavathis) {
        for (const area of upavathi.areas) {
          const member = area.members.find((m) => m.id === memberId);
          if (!member) continue;

          if (update.name?.trim()) member.name = update.name.trim();
          if (update.phone !== undefined) member.phone = update.phone.trim() || undefined;
          if (update.role !== undefined) member.role = update.role.trim() || undefined;
          if (update.address !== undefined) member.address = update.address.trim() || undefined;
          if (update.joinedDate !== undefined) {
            member.joinedDate = update.joinedDate.trim() || undefined;
          }

          await saveMandal(mandal);
          return {
            ...member,
            areaId: area.id,
            areaName: area.name,
            upavathiName: upavathi.name,
            gramaName: grama.name,
            stanaName: stana.name,
          };
        }
      }
    }
  }
  return null;
}

export async function removeMember(memberId: string): Promise<boolean> {
  const mandal = await getMandal();
  for (const stana of mandal.stanas) {
    for (const grama of stana.gramas) {
      for (const upavathi of grama.upavathis) {
        for (const area of upavathi.areas) {
          const before = area.members.length;
          area.members = area.members.filter((m) => m.id !== memberId);
          if (area.members.length < before) {
            await saveMandal(mandal);
            return true;
          }
        }
      }
    }
  }
  return false;
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

export async function addStana(input: StanaInput): Promise<Stana> {
  const mandal = await getMandal();
  const name = input.name.trim();
  let id = slugifyId(name, "stana");
  const existingIds = new Set(mandal.stanas.map((s) => s.id));
  if (existingIds.has(id)) {
    id = `${id}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const stana: Stana = { id, name, gramas: [] };
  mandal.stanas.push(stana);
  await saveMandal(mandal);
  return stana;
}

export async function updateStana(stanaId: string, name: string): Promise<Stana | null> {
  const mandal = await getMandal();
  const stana = findStana(mandal, stanaId);
  if (!stana) return null;
  stana.name = name.trim();
  await saveMandal(mandal);
  return stana;
}

export async function removeStana(stanaId: string): Promise<boolean> {
  const mandal = await getMandal();
  const before = mandal.stanas.length;
  mandal.stanas = mandal.stanas.filter((s) => s.id !== stanaId);
  if (mandal.stanas.length < before) {
    await saveMandal(mandal);
    return true;
  }
  return false;
}

export async function addGrama(input: GramaInput): Promise<Grama> {
  const mandal = await getMandal();
  const stana = findStana(mandal, input.stanaId);
  if (!stana) throw new Error("Stana not found");

  const name = input.name.trim();
  let id = slugifyId(name, "grama");
  const existingIds = new Set(stana.gramas.map((g) => g.id));
  if (existingIds.has(id)) {
    id = `${id}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const grama: Grama = { id, name, upavathis: [] };
  stana.gramas.push(grama);
  await saveMandal(mandal);
  return grama;
}

export async function updateGrama(
  stanaId: string,
  gramaId: string,
  name: string
): Promise<Grama | null> {
  const mandal = await getMandal();
  const found = findGramaInMandal(mandal, stanaId, gramaId);
  if (!found) return null;
  found.grama.name = name.trim();
  await saveMandal(mandal);
  return found.grama;
}

export async function removeGrama(stanaId: string, gramaId: string): Promise<boolean> {
  const mandal = await getMandal();
  const stana = findStana(mandal, stanaId);
  if (!stana) return false;
  const before = stana.gramas.length;
  stana.gramas = stana.gramas.filter((g) => g.id !== gramaId);
  if (stana.gramas.length < before) {
    await saveMandal(mandal);
    return true;
  }
  return false;
}

export async function addUpavathi(input: UpavathiInput): Promise<Upavathi> {
  const mandal = await getMandal();
  const found = findGramaInMandal(mandal, input.stanaId, input.gramaId);
  if (!found) throw new Error("Grama not found");

  const name = input.name.trim();
  let id = slugifyId(name, "upavathi");
  const existingIds = new Set(found.grama.upavathis.map((u) => u.id));
  if (existingIds.has(id)) {
    id = `${id}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const upavathi: Upavathi = { id, name, areas: [] };
  found.grama.upavathis.push(upavathi);
  await saveMandal(mandal);
  return upavathi;
}

export async function updateUpavathi(
  stanaId: string,
  gramaId: string,
  upavathiId: string,
  name: string
): Promise<Upavathi | null> {
  const mandal = await getMandal();
  const found = findUpavathiInMandal(mandal, stanaId, gramaId, upavathiId);
  if (!found) return null;
  found.upavathi.name = name.trim();
  await saveMandal(mandal);
  return found.upavathi;
}

export async function removeUpavathi(
  stanaId: string,
  gramaId: string,
  upavathiId: string
): Promise<boolean> {
  const mandal = await getMandal();
  const found = findGramaInMandal(mandal, stanaId, gramaId);
  if (!found) return false;
  const before = found.grama.upavathis.length;
  found.grama.upavathis = found.grama.upavathis.filter((u) => u.id !== upavathiId);
  if (found.grama.upavathis.length < before) {
    await saveMandal(mandal);
    return true;
  }
  return false;
}

export async function addArea(input: AreaInput): Promise<Area> {
  const mandal = await getMandal();
  const found = findUpavathiInMandal(mandal, input.stanaId, input.gramaId, input.upavathiId);
  if (!found) throw new Error("Upavathi not found");

  const name = input.name.trim();
  let id = slugifyId(name, "area");
  const existingIds = new Set(found.upavathi.areas.map((a) => a.id));
  if (existingIds.has(id)) {
    id = `${id}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const area: Area = { id, name, members: [] };
  found.upavathi.areas.push(area);
  await saveMandal(mandal);
  return area;
}

export async function updateArea(
  stanaId: string,
  gramaId: string,
  upavathiId: string,
  areaId: string,
  name: string
): Promise<Area | null> {
  const mandal = await getMandal();
  const found = findUpavathiInMandal(mandal, stanaId, gramaId, upavathiId);
  if (!found) return null;
  const area = findArea(found.upavathi, areaId);
  if (!area) return null;
  area.name = name.trim();
  await saveMandal(mandal);
  return area;
}

export async function removeArea(
  stanaId: string,
  gramaId: string,
  upavathiId: string,
  areaId: string
): Promise<boolean> {
  const mandal = await getMandal();
  const found = findUpavathiInMandal(mandal, stanaId, gramaId, upavathiId);
  if (!found) return false;
  const before = found.upavathi.areas.length;
  found.upavathi.areas = found.upavathi.areas.filter((a) => a.id !== areaId);
  if (found.upavathi.areas.length < before) {
    await saveMandal(mandal);
    return true;
  }
  return false;
}
