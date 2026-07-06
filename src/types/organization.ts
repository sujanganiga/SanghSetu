export interface Member {
  id: string;
  name: string;
  phone?: string;
  role?: string;
  address?: string;
  joinedDate?: string;
}

export interface MemberInput {
  areaId: string;
  name: string;
  phone?: string;
  role?: string;
  address?: string;
  joinedDate?: string;
}

export interface MemberUpdate {
  name?: string;
  phone?: string;
  role?: string;
  address?: string;
  joinedDate?: string;
}

export interface MemberWithPath extends Member {
  areaId: string;
  areaName: string;
  upavathiName: string;
  gramaName: string;
  stanaName: string;
}

export interface Area {
  id: string;
  name: string;
  members: Member[];
}

export interface Upavathi {
  id: string;
  name: string;
  areas: Area[];
}

export interface Grama {
  id: string;
  name: string;
  upavathis: Upavathi[];
}

export interface Stana {
  id: string;
  name: string;
  gramas: Grama[];
}

export interface Mandal {
  id: string;
  name: string;
  stanas: Stana[];
}

export type NavLevel = "mandal" | "stana" | "grama" | "upavathi" | "area" | "all-members";

export interface NavState {
  level: NavLevel;
  stanaId?: string;
  gramaId?: string;
  upavathiId?: string;
  areaId?: string;
}

export interface HierarchyPath {
  stana?: Stana;
  grama?: Grama;
  upavathi?: Upavathi;
  area?: Area;
}

export interface AreaOption {
  areaId: string;
  label: string;
}

export interface GramaInput {
  stanaId: string;
  name: string;
}

export interface UpavathiInput {
  stanaId: string;
  gramaId: string;
  name: string;
}

export interface AreaInput {
  stanaId: string;
  gramaId: string;
  upavathiId: string;
  name: string;
}

export interface StanaInput {
  name: string;
}

export interface NameUpdate {
  name: string;
}
