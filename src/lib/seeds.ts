export function setSeeds(base: number, n: number): number[] {
  const seeds: number[] = [];
  for (let i = 0; i < n; i++) {
    seeds.push((base + 73 + i * 911) % 10000);
  }
  return seeds;
}

