/** Display labels for the RSS organizational hierarchy (code keys unchanged). */
export const LABELS = {
  taluku: "Taluku",
  mandala: "Mandala",
  grama: "Grama",
  upavasathi: "Upavasathi",
  areaShakaha: "Area (Shakaha)",
} as const;

export const HIERARCHY_PATH = `${LABELS.taluku} → ${LABELS.mandala} → ${LABELS.grama} → ${LABELS.upavasathi} → ${LABELS.areaShakaha}`;
