import { useEffect } from 'react';

/**
 * Hook to suppress React warnings about Form components
 * Use this temporarily to hide Form-related warnings in console
 */
export const useSupressFormWarnings = () => {
  useEffect(() => {
    // Store original console.warn
    const originalWarn = console.warn;
    
    // Override console.warn to filter out specific Form warnings
    console.warn = (...args: unknown[]) => {
      const message = args[0];
      
      // Check if it's a Form-related warning we want to suppress
      if (typeof message === 'string' && (
        message.includes('validateDOMNesting') ||
        message.includes('Form.Item') ||
        message.includes('<form>') ||
        message.includes('form element')
      )) {
        return; // Suppress this warning
      }
      
      // Call original console.warn for other warnings
      originalWarn.apply(console, args);
    };
    
    // Cleanup on unmount
    return () => {
      console.warn = originalWarn;
    };
  }, []);
};

export default useSupressFormWarnings;
