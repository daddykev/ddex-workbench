// Theme management utility
class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'ddex-theme-preference';
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto'
    };
    
    // Initialize on creation
    this.init();
  }

  init() {
    // Get saved preference or default to auto
    const savedTheme = this.getSavedTheme() || this.THEMES.AUTO;
    this.setTheme(savedTheme);
    
    // Listen for system theme changes
    this.watchSystemTheme();
  }

  getSavedTheme() {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to get saved theme:', e);
      return null;
    }
  }

  saveTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }

  setTheme(theme) {
    // Save the preference
    this.saveTheme(theme);
    
    // Apply the appropriate theme
    if (theme === this.THEMES.AUTO) {
      this.applySystemTheme();
    } else {
      this.applyTheme(theme);
    }
  }

  applyTheme(theme) {
    // Remove all theme classes
    document.documentElement.removeAttribute('data-theme');
    
    // Apply the selected theme
    if (theme === this.THEMES.DARK) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme } 
    }));
  }

  applySystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(prefersDark ? this.THEMES.DARK : this.THEMES.LIGHT);
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        if (this.getSavedTheme() === this.THEMES.AUTO) {
          this.applySystemTheme();
        }
      });
    } else {
      // Fallback for older browsers
      mediaQuery.addListener((e) => {
        if (this.getSavedTheme() === this.THEMES.AUTO) {
          this.applySystemTheme();
        }
      });
    }
  }

  getCurrentTheme() {
    const savedTheme = this.getSavedTheme();
    if (savedTheme === this.THEMES.AUTO) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? this.THEMES.DARK 
        : this.THEMES.LIGHT;
    }
    return savedTheme || this.THEMES.LIGHT;
  }

  getThemePreference() {
    return this.getSavedTheme() || this.THEMES.AUTO;
  }

  toggleTheme() {
    const current = this.getCurrentTheme();
    const next = current === this.THEMES.LIGHT ? this.THEMES.DARK : this.THEMES.LIGHT;
    this.setTheme(next);
  }
}

// Export singleton instance
export default new ThemeManager();

// Export class for testing or multiple instances
export { ThemeManager };