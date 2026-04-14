/**
 * 根据修改次数返回对应的热力颜色
 */
export function getHeatColor(count: number): string {
  if (count === 0) return "hsl(var(--muted))";
  if (count <= 2) return "hsl(var(--primary) / 0.3)";
  if (count <= 5) return "hsl(var(--primary) / 0.6)";
  return "hsl(var(--primary))";
}
