export const CAMPUS_MAP = {
  AMW:  "AIM Chicago",
  AMA:  "AIM Atlanta",
  AMC:  "AIM Charlotte",
  AMD:  "AIM Dallas",
  AMH:  "AIM Houston",
  AMI:  "AIM Indianapolis",
  AMK:  "AIM Kansas City",
  AML:  "AIM Las Vegas",
  AMM:  "AIM Manassas",
  AMN:  "AIM Norfolk",
  AMO:  "AIM Orlando",
  AMP:  "AIM Philadelphia",
  AMS:  "AIM Fremont",
  AMT:  "AIM Hasbrouck Heights",
  AMX:  "AIM Phoenix",
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
