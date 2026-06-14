export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { ease: EASE, duration: 0.48 } },
};

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
