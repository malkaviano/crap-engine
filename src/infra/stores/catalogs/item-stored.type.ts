export type ItemStored = {
  readonly itemInfo: { name: string; label: string; description: string };
  readonly category: string;
  readonly usability: string;
  readonly skillName: string | null;
  readonly weapon: string | null;
  readonly consumable: string | null;
  readonly readable: string | null;
};
