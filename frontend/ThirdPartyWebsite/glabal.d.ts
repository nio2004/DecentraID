// src/types/globals.d.ts
declare global {
    interface Window {
      // Add properties you may need for window object here
      myCustomProperty?: string;
    }
  }
  
  export {}; // Ensure this file is treated as a module
  