export function parseSalary(raw) {
  if (!raw) return 0;
  const str = raw.toString().trim();

  // K-notation: $105K, 80K, 105K (min)
  const kMatch = str.match(/(\d+\.?\d*)\s*[Kk]/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  const cleaned = str.replace(/[$,]/g, "");

  // Range: "32-38", "$32-$38", "68,000-70,000"
  const rangeMatch = cleaned.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (rangeMatch) {
    const avg = (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
    return avg < 1000 ? Math.round(avg * 2080) : Math.round(avg);
  }

  const numMatch = cleaned.match(/(\d+\.?\d*)/);
  if (!numMatch) return 0;
  const val = parseFloat(numMatch[1]);
  return val < 500 ? Math.round(val * 2080) : Math.round(val);
}
