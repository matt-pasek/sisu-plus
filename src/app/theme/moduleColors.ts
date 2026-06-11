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
  {
    value: '#2dd4bf',
    accent: 'bg-[#2dd4bf]',
    bgDim: 'bg-[#2dd4bf]/10',
    progress: 'bg-[#2dd4bf]',
    text: 'text-[#2dd4bf]',
  },
  {
    value: '#84cc16',
    accent: 'bg-[#84cc16]',
    bgDim: 'bg-[#84cc16]/10',
    progress: 'bg-[#84cc16]',
    text: 'text-[#84cc16]',
  },
  {
    value: '#facc15',
    accent: 'bg-[#facc15]',
    bgDim: 'bg-[#facc15]/10',
    progress: 'bg-[#facc15]',
    text: 'text-[#facc15]',
  },
  {
    value: '#34d399',
    accent: 'bg-[#34d399]',
    bgDim: 'bg-[#34d399]/10',
    progress: 'bg-[#34d399]',
    text: 'text-[#34d399]',
  },
  {
    value: '#e879f9',
    accent: 'bg-[#e879f9]',
    bgDim: 'bg-[#e879f9]/10',
    progress: 'bg-[#e879f9]',
    text: 'text-[#e879f9]',
  },
  {
    value: '#f97316',
    accent: 'bg-[#f97316]',
    bgDim: 'bg-[#f97316]/10',
    progress: 'bg-[#f97316]',
    text: 'text-[#f97316]',
  },
  {
    value: '#64748b',
    accent: 'bg-[#64748b]',
    bgDim: 'bg-[#64748b]/10',
    progress: 'bg-[#64748b]',
    text: 'text-[#64748b]',
  },
];

export const MODULE_COLOR_VALUES = MODULE_COLORS.map((color) => color.value);

const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (((hash << 5) + hash) ^ str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getModuleColorByIndex = (index: number): ModuleColor => MODULE_COLORS[index % MODULE_COLORS.length];

export const getModuleColorValueByIndex = (index: number): string => getModuleColorByIndex(index).value;

export const getModuleColor = (moduleId: string | null): string => {
  if (!moduleId) return '#7878A0';
  return MODULE_COLORS[hashString(moduleId) % MODULE_COLORS.length].value;
};

export const getModuleColorObject = (moduleId: string | null): ModuleColor =>
  moduleId ? MODULE_COLORS[hashString(moduleId) % MODULE_COLORS.length] : MODULE_COLORS[0];
