export const themes = {
  technical: {
    name: 'Technical Developer',
    description: 'Clean, modern theme for developers and tech professionals with day/night mode',
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#00D4AA'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      code: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'
    },
    style: 'minimal',
    supportsDarkMode: true,
    layout: {
      type: 'code',
      features: ['terminal', 'codeBlocks', 'techStack'],
      preview: {
        icon: '💻',
        demo: 'const portfolio = { skills: ["React", "Node.js"] };',
        elements: ['</', '{ }', '=>']
      }
    }
  },
  
  photographer: {
    name: 'Creative Photographer',
    description: 'Elegant, visual-focused theme for photographers and artists',
    colors: {
      primary: '#2C2C2C',
      secondary: '#D4AF37',
      accent: '#FF6B6B',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      textSecondary: '#666666'
    },
    fonts: {
      primary: '"Playfair Display", "Georgia", serif',
      secondary: '"Inter", sans-serif'
    },
    style: 'elegant',
    layout: {
      type: 'gallery',
      features: ['imageSlider', 'portfolio', 'lightbox'],
      preview: {
        icon: '📸',
        demo: 'Beautiful moments captured in time',
        elements: ['🖼️', '🎨', '✨']
      }
    }
  },
  
  influencer: {
    name: 'Social Influencer',
    description: 'Vibrant, engaging theme for content creators and influencers',
    colors: {
      primary: '#E91E63',
      secondary: '#9C27B0',
      accent: '#FF9800',
      background: '#FFF8F0',
      surface: '#FFFFFF',
      text: '#212121',
      textSecondary: '#757575'
    },
    fonts: {
      primary: '"Poppins", sans-serif',
      secondary: '"Open Sans", sans-serif'
    },
    style: 'vibrant',
    layout: {
      type: 'social',
      features: ['videoPlayer', 'socialFeed', 'stories'],
      preview: {
        icon: '🎬',
        demo: 'Creating content that inspires',
        elements: ['▶️', '❤️', '💬']
      }
    }
  },
  
  doctor: {
    name: 'Medical Professional',
    description: 'Professional, trustworthy theme for healthcare professionals',
    colors: {
      primary: '#0D47A1',
      secondary: '#1976D2',
      accent: '#4CAF50',
      background: '#F8FBFF',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#5F6368'
    },
    fonts: {
      primary: '"Source Sans Pro", sans-serif',
      secondary: '"Roboto", sans-serif'
    },
    style: 'professional',
    layout: {
      type: 'medical',
      features: ['appointments', 'credentials', 'testimonials'],
      preview: {
        icon: '🏥',
        demo: 'Dedicated to patient care and wellness',
        elements: ['🩺', '📋', '⚕️']
      }
    }
  },
  
  advocate: {
    name: 'Legal Professional',
    description: 'Sophisticated, authoritative theme for lawyers and advocates',
    colors: {
      primary: '#1A237E',
      secondary: '#3F51B5',
      accent: '#B8860B',
      background: '#FAFBFC',
      surface: '#FFFFFF',
      text: '#1C1C1C',
      textSecondary: '#4A4A4A'
    },
    fonts: {
      primary: '"Crimson Text", serif',
      secondary: '"Lato", sans-serif'
    },
    style: 'sophisticated',
    layout: {
      type: 'legal',
      features: ['caseStudies', 'publications', 'awards'],
      preview: {
        icon: '⚖️',
        demo: 'Justice through legal excellence',
        elements: ['📚', '🏛️', '📜']
      }
    }
  },
  
  business: {
    name: 'Business Executive',
    description: 'Corporate, premium theme for business owners and executives',
    colors: {
      primary: '#1B5E20',
      secondary: '#388E3C',
      accent: '#FFC107',
      background: '#F1F8E9',
      surface: '#FFFFFF',
      text: '#1B1B1B',
      textSecondary: '#424242'
    },
    fonts: {
      primary: '"Merriweather", serif',
      secondary: '"Source Sans Pro", sans-serif'
    },
    style: 'corporate',
    layout: {
      type: 'corporate',
      features: ['charts', 'timeline', 'achievements'],
      preview: {
        icon: '💼',
        demo: 'Strategic solutions for growth',
        elements: ['📊', '📈', '🎯']
      }
    }
  }
};

export const getThemePreview = (themeKey) => {
  const theme = themes[themeKey];
  return theme?.layout?.preview || { icon: '🎨', demo: 'Sample content', elements: [] };
};

export const availableThemes = Object.keys(themes).map(key => ({
  key,
  ...themes[key]
}));

export default themes;

export const applyTheme = (themeKey) => {
  const theme = themes[themeKey];
  if (!theme || themeKey === 'technical') return;

  const root = document.documentElement;
  
  // Only for non-technical themes
  root.style.setProperty('--primary-color', theme.colors.primary);
  root.style.setProperty('--secondary-color', theme.colors.secondary);
  root.style.setProperty('--accent-color', theme.colors.accent);
  root.style.setProperty('--bg-primary', theme.colors.background);
  root.style.setProperty('--bg-secondary', theme.colors.surface);
  root.style.setProperty('--text-primary', theme.colors.text);
  root.style.setProperty('--text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--font-primary', theme.fonts.primary);
  root.style.setProperty('--font-secondary', theme.fonts.secondary || theme.fonts.primary);
  
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${themeKey}`);
  
  localStorage.setItem('selectedTheme', themeKey);
};

export const applyTechnicalTheme = () => {
  const root = document.documentElement;
  
  // Only set colors for technical theme
  root.style.setProperty('--primary-color', themes.technical.colors.primary);
  root.style.setProperty('--secondary-color', themes.technical.colors.secondary);
  root.style.setProperty('--accent-color', themes.technical.colors.accent);
  
  // Remove any overridden variables to restore original CSS
  root.style.removeProperty('--bg-primary');
  root.style.removeProperty('--bg-secondary');
  root.style.removeProperty('--text-primary');
  root.style.removeProperty('--text-secondary');
  root.style.removeProperty('--font-primary');
  root.style.removeProperty('--font-secondary');
  
  // Clear theme classes
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  
  localStorage.setItem('selectedTheme', 'technical');
};