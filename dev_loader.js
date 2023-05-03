const normalizeSrc = src => {
  return src.startsWith('/') ? src.slice(1) : src;
};

export default function devLoader ({ src, width, quality }) {
  return `/images/${normalizeSrc(src)}`;
};