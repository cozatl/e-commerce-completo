// 1. Import all images eagerly
const globImages: Record<string, any> = import.meta.glob(
  '../../assets/img/**/*.{png,jpg,jpeg,svg}', 
  { eager: true }
);

// 2. Format keys to get the variable for images
const images: Record<string, string> = {};

Object.entries(globImages).forEach(([path, module]) => {
  // Extract just the filename (e.g., "logo.jpg")
  const fileName = path.split('/').pop() || ''; 
  
  // Assign the actual resolved asset URL
  images[fileName] = module.default;
});

export { images };   // Module used to get the local images for the elements is the project