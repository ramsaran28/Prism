import type { LabValue, ValueStatus } from "@/lib/types";

/** Normalized key → plain English display name */
const PLAIN_NAME_MAP: Record<string, string> = {
  // Blood count
  hemoglobin: "Oxygen in your blood",
  hematocrit: "Blood thickness",
  mcv: "Red cell size",
  mch: "Color of red cells",
  mchc: "Red cell strength",
  rdw: "Red cell variety",
  rbc: "Red blood cells",
  redbloodcells: "Red blood cells",
  wbc: "Infection fighters",
  whitebloodcells: "Infection fighters",
  platelets: "Clotting cells",
  plateletcount: "Clotting cells",
  neutrophils: "First responders",
  lymphocytes: "Immune soldiers",
  monocytes: "Cleanup crew",
  eosinophils: "Allergy fighters",
  basophils: "Alarm cells",
  // Diabetes
  hba1c: "3-month sugar average",
  fastingbloodglucose: "Morning blood sugar",
  fastingglucose: "Morning blood sugar",
  glucose: "Morning blood sugar",
  bloodglucose: "Morning blood sugar",
  estimatedaverageglucose: "Daily sugar estimate",
  eag: "Daily sugar estimate",
  fastinginsulin: "Insulin level",
  homair: "Sugar resistance",
  cpeptide: "Insulin production",
  // Heart & cholesterol
  totalcholesterol: "Total fat in blood",
  cholesterol: "Total fat in blood",
  ldlcholesterol: "Bad cholesterol",
  ldl: "Bad cholesterol",
  hdlcholesterol: "Good cholesterol",
  hdl: "Good cholesterol",
  vldlcholesterol: "Hidden bad fat",
  vldl: "Hidden bad fat",
  triglycerides: "Blood fat",
  tchdlratio: "Heart risk ratio",
  tchdl: "Heart risk ratio",
  ldlhdlratio: "Cholesterol balance",
  nonhdlcholesterol: "Harmful cholesterol",
  nonhdl: "Harmful cholesterol",
  apolipoproteinb: "Harmful fat carrier",
  apob: "Harmful fat carrier",
  lipoproteina: "Sticky bad fat",
  lpa: "Sticky bad fat",
  hscrp: "Body inflammation",
  crp: "Body inflammation",
  // Kidney
  creatinine: "Kidney waste filter",
  egfr: "Kidney filtering speed",
  bun: "Protein waste in blood",
  bloodureanitrogen: "Protein waste in blood",
  buncreatinineratio: "Kidney strain ratio",
  uricacid: "Joint crystal risk",
  sodium: "Salt balance",
  potassium: "Heart mineral",
  chloride: "Fluid balance",
  microalbumin: "Kidney protein leak",
  urinecreatinine: "Kidney output",
  // Liver
  totalbilirubin: "Liver waste color",
  bilirubin: "Liver waste color",
  directbilirubin: "Active liver waste",
  sgot: "Liver stress marker 1",
  ast: "Liver stress marker 1",
  sgpt: "Liver stress marker 2",
  alt: "Liver stress marker 2",
  alkalinephosphatase: "Bone & liver enzyme",
  alp: "Bone & liver enzyme",
  ggt: "Liver irritation",
  totalprotein: "Body protein",
  albumin: "Nutrition protein",
  agratio: "Protein balance",
  // Thyroid
  tsh: "Thyroid control signal",
  freet4: "Thyroid hormone",
  ft4: "Thyroid hormone",
  freet3: "Active thyroid hormone",
  ft3: "Active thyroid hormone",
  antitpoantibodies: "Thyroid attack cells",
  antitpo: "Thyroid attack cells",
  tpo: "Thyroid attack cells",
  // Vitamins & minerals
  vitamind3: "Sunshine vitamin",
  vitamind: "Sunshine vitamin",
  vitaminb12: "Energy vitamin",
  b12: "Energy vitamin",
  folate: "Cell repair vitamin",
  serumiron: "Iron stores",
  iron: "Iron stores",
  tibc: "Iron carrying capacity",
  transferrinsaturation: "Iron delivery rate",
  ferritin: "Iron reserve",
  magnesium: "Muscle mineral",
  calcium: "Bone strength",
  phosphorus: "Bone strength",
};

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getValueLabel(value: LabValue): string {
  return toPlainEnglishName(value.medicalName ?? value.name);
}

export function toPlainEnglishName(name: string): string {
  const key = normalizeKey(name);
  if (PLAIN_NAME_MAP[key]) return PLAIN_NAME_MAP[key];

  for (const [mapKey, plain] of Object.entries(PLAIN_NAME_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return plain;
  }

  return name
    .replace(/\([^)]*\)/g, "")
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function valuesWithPlainNames(values: LabValue[]): LabValue[] {
  return values.map((v) => ({
    ...v,
    medicalName: v.medicalName ?? v.name,
    name: getValueLabel(v),
  }));
}

/** Normalize scan results: keep medical name for matching, plain name for display. */
export function normalizeLabValues(values: LabValue[]): LabValue[] {
  return values.map((v) => {
    const medicalName = v.medicalName ?? v.name;
    const plain = toPlainEnglishName(medicalName);
    return {
      ...v,
      medicalName,
      name: plain,
    };
  });
}

export function getWarmStatusLine(status: ValueStatus): string {
  switch (status) {
    case "normal":
      return "This is healthy.";
    case "low":
      return "A bit low — worth keeping an eye on.";
    case "high":
      return "Running high — worth a closer look.";
  }
}

export function getWarmDetailMessage(
  plainName: string,
  status: ValueStatus
): string {
  const label = plainName.toLowerCase();
  switch (status) {
    case "normal":
      return `Your ${label} looks healthy right now.`;
    case "low":
      return `Your ${label} is a little lower than ideal.`;
    case "high":
      return `Your ${label} is running higher than ideal.`;
  }
}

export const PLAIN_LANGUAGE_RULES = `Never use medical terminology.
Refer to every lab value only by its plain English name (examples: "Oxygen in your blood" not hemoglobin, "Immune soldiers" not lymphocytes, "Bad cholesterol" not LDL).
Write as if explaining to someone who has never seen a lab report before.
Use warm, reassuring language.`;
