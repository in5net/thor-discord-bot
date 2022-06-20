import Progress from './progress';

const bar = new Progress('Generating cheesecake 🧀🍰', 100);

const timer = setInterval(() => {
  bar.inc();
  if (bar.value === bar.total) clearInterval(timer);
}, 100);
