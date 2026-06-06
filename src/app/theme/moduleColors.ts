export type ModuleColor = {
  value: string;
  accent: string;
  bgDim: string;
  progress: string;
  text: string;
};

export const MODULE_COLORS: ModuleColor[] = [
  {
    value: '#a78bfa',
    accent: 'bg-[#a78bfa]',
    bgDim: 'bg-[#a78bfa]/10',
    progress: 'bg-[#a78bfa]',
    text: 'text-[#a78bfa]',
  },
  {
    value: '#f0a84e',
    accent: 'bg-[#f0a84e]',
    bgDim: 'bg-[#f0a84e]/10',
    progress: 'bg-[#f0a84e]',
    text: 'text-[#f0a84e]',
  },
  {
    value: '#5b8df6',
    accent: 'bg-[#5b8df6]',
    bgDim: 'bg-[#5b8df6]/10',
    progress: 'bg-[#5b8df6]',
    text: 'text-[#5b8df6]',
  },
  {
    value: '#f06b6b',
    accent: 'bg-[#f06b6b]',
    bgDim: 'bg-[#f06b6b]/10',
    progress: 'bg-[#f06b6b]',
    text: 'text-[#f06b6b]',
  },
  {
    value: '#f472b6',
    accent: 'bg-[#f472b6]',
    bgDim: 'bg-[#f472b6]/10',
    progress: 'bg-[#f472b6]',
    text: 'text-[#f472b6]',
  },
];

export const MODULE_COLOR_VALUES = MODULE_COLORS.map((color) => color.value);

export const getModuleColorByIndex = (index: number): ModuleColor => MODULE_COLORS[index % MODULE_COLORS.length];

export const getModuleColorValueByIndex = (index: number): string => getModuleColorByIndex(index).value;

export const getModuleColor = (moduleId: string | null, moduleIds: string[]): string => {
  if (!moduleId) return '#7878A0';
  const index = moduleIds.indexOf(moduleId);
  return getModuleColorValueByIndex(index >= 0 ? index : 0);
};
