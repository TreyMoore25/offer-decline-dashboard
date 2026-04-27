export const CAMPUS_MAP = {
  AMW:  "Chicago",
  AMA:  "Atlanta",
  AMC:  "Charlotte",
  AMD:  "Dallas",
  AMH:  "Houston",
  AMI:  "Indianapolis",
  AMK:  "Kansas City",
  AML:  "Las Vegas",
  AMM:  "Manassas",
  AMN:  "Norfolk",
  AMO:  "Orlando",
  AMP:  "Philadelphia",
  AMS:  "Fremont",
  AMT:  "Hasbrouck Heights",
  AMX:  "Phoenix",
  CCHE: "Centura Chesapeake",
  CNOR: "Centura Norfolk",
  CPEN: "Centura Newport News",
  TTLC:      "Tidewater Tech - Little Creek",
  TTTLC:     "Tidewater Tech - Little Creek",
  TTT:       "Tidewater Tech Trades",
  "HOME OFC": "Home Office",
};

export function resolveCampus(raw) {
  if (!raw) return raw;
  const code = raw.toString().trim().toUpperCase();
  return CAMPUS_MAP[code] ?? raw;
}
