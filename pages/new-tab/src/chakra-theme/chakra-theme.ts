import { extendBaseTheme, theme } from '@chakra-ui/react';
import { HtmlContent } from './html-content';

export const chakraTheme = extendBaseTheme(theme, {
  semanticTokens: {
    colors: {
      'chakra-body-text': {
        _light: 'gray.800',
        _dark: 'whiteAlpha.900',
      },
      'chakra-body-bg': {
        _light: 'white',
        _dark: 'gray.800',
      },
      'chakra-border-color': {
        _light: 'gray.200',
        _dark: 'whiteAlpha.300',
      },
      'chakra-inverse-text': {
        _light: 'white',
        _dark: 'gray.800',
      },
      'chakra-subtle-bg': {
        _light: 'gray.100',
        _dark: 'gray.700',
      },
      'chakra-subtle-text': {
        _light: 'gray.600',
        _dark: 'gray.400',
      },
      'chakra-placeholder-color': {
        _light: 'gray.500',
        _dark: 'whiteAlpha.400',
      },
    },
  },
  direction: 'ltr',
  breakpoints: {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  radii: {
    none: '0',
    sm: '3px',
    base: '0.25rem',
    md: '5px',
    lg: '10px',
    xl: '16px',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
    default: '3px',
    small: '3px',
    large: '5px',
    xlarge: '10px',
    xxlarge: '16px',
  },
  blur: {
    none: 0,
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    black: '#000000',
    white: '#FFFFFF',
    whiteAlpha: {
      '50': 'rgba(255, 255, 255, 0.04)',
      '100': 'rgba(255, 255, 255, 0.06)',
      '200': 'rgba(255, 255, 255, 0.08)',
      '300': 'rgba(255, 255, 255, 0.16)',
      '400': 'rgba(255, 255, 255, 0.24)',
      '500': 'rgba(255, 255, 255, 0.36)',
      '600': 'rgba(255, 255, 255, 0.48)',
      '700': 'rgba(255, 255, 255, 0.64)',
      '800': 'rgba(255, 255, 255, 0.80)',
      '900': 'rgba(255, 255, 255, 0.92)',
    },
    blackAlpha: {
      '50': 'rgba(0, 0, 0, 0.04)',
      '100': 'rgba(0, 0, 0, 0.06)',
      '200': 'rgba(0, 0, 0, 0.08)',
      '300': 'rgba(0, 0, 0, 0.16)',
      '400': 'rgba(0, 0, 0, 0.24)',
      '500': 'rgba(0, 0, 0, 0.36)',
      '600': 'rgba(0, 0, 0, 0.48)',
      '700': 'rgba(0, 0, 0, 0.64)',
      '800': 'rgba(0, 0, 0, 0.80)',
      '900': 'rgba(0, 0, 0, 0.92)',
    },
    gray: {
      '50': '#FAFAFA',
      '100': '#F5F5F4',
      '200': '#ECEBEA',
      '300': '#D5D4D2',
      '400': '#BDBAB7',
      '500': '#A09C98',
      '600': '#807D7A',
      '700': '#605E5B',
      '800': '#403E3D',
      '900': '#201F1E',
    },
    red: {
      '50': '#FDE7E7',
      '100': '#FECDCD',
      '200': '#FE9A9A',
      '300': '#F66F6F',
      '400': '#EC4B4B',
      '500': '#DD2222',
      '600': '#B81414',
      '700': '#940505',
      '800': '#650101',
      '900': '#330000',
      default: '#df524a',
      light: '#ffeaea',
      medium: '#df524a',
      dark: '#862c25',
    },
    orange: {
      '50': '#FFECE9',
      '100': '#FFDAD3',
      '200': '#FFB4A7',
      '300': '#FF8F7A',
      '400': '#FF694E',
      '500': '#F4502A',
      '600': '#DF320C',
      '700': '#C22B0A',
      '800': '#912108',
      '900': '#5C2012',
    },
    yellow: {
      '50': '#FFF8DB',
      '100': '#FDEDAA',
      '200': '#FDD97D',
      '300': '#FBC63C',
      '400': '#F09700',
      '500': '#D97706',
      '600': '#B45309',
      '700': '#92400E',
      '800': '#78350F',
      '900': '#5B280B',
      default: '#fdb25a',
      light: '#fef9ee',
      medium: '#fdb25a',
      dark: '#a26b18',
    },
    green: {
      '50': '#E8FDF6',
      '100': '#C5F6E6',
      '200': '#8EE9CC',
      '300': '#5ED7B1',
      '400': '#2DC495',
      '500': '#08A674',
      '600': '#06855D',
      '700': '#056647',
      '800': '#044933',
      '900': '#023223',
      default: '#00b46e',
      light: '#e3f5ee',
      medium: '#00b46e',
      dark: '#00754b',
    },
    teal: {
      '50': '#F1F9F9',
      '100': '#DCEFEF',
      '200': '#BADBDE',
      '300': '#98C9CD',
      '400': '#72B9C0',
      '500': '#44A3AB',
      '600': '#308188',
      '700': '#1D585E',
      '800': '#1D4649',
      '900': '#143133',
    },
    blue: {
      '50': '#E6F0FE',
      '100': '#CFE0FC',
      '200': '#9EC1FA',
      '300': '#6EA2F6',
      '400': '#3E84F4',
      '500': '#0F65F0',
      '600': '#1553B7',
      '700': '#103E89',
      '800': '#0A2A5C',
      '900': '#06152D',
      default: '#4285f4',
      light: '#ebf4ff',
      medium: '#4285f4',
      dark: '#226588',
    },
    cyan: {
      '50': '#EDFDFD',
      '100': '#C4F1F9',
      '200': '#9DECF9',
      '300': '#76E4F7',
      '400': '#0BC5EA',
      '500': '#00B5D8',
      '600': '#00A3C4',
      '700': '#0987A0',
      '800': '#086F83',
      '900': '#065666',
    },
    purple: {
      '50': '#E8E7FF',
      '100': '#D5D2F9',
      '200': '#B8B4F5',
      '300': '#9C96F0',
      '400': '#7169EA',
      '500': '#5A51E7',
      '600': '#4940CE',
      '700': '#423CAA',
      '800': '#36318C',
      '900': '#2B266D',
    },
    pink: {
      '50': '#FBF1F0',
      '100': '#F5DAD6',
      '200': '#F0C5C2',
      '300': '#EAAEA9',
      '400': '#E49790',
      '500': '#DB766B',
      '600': '#C26157',
      '700': '#A3554D',
      '800': '#854841',
      '900': '#6E3B36',
    },
    linkedin: {
      '50': '#E8F4F9',
      '100': '#CFEDFB',
      '200': '#9BDAF3',
      '300': '#68C7EC',
      '400': '#34B3E4',
      '500': '#00A0DC',
      '600': '#008CC9',
      '700': '#0077B5',
      '800': '#005E93',
      '900': '#004471',
    },
    facebook: {
      '50': '#E8F4F9',
      '100': '#D9DEE9',
      '200': '#B7C2DA',
      '300': '#6482C0',
      '400': '#4267B2',
      '500': '#385898',
      '600': '#314E89',
      '700': '#29487D',
      '800': '#223B67',
      '900': '#1E355B',
    },
    messenger: {
      '50': '#D0E6FF',
      '100': '#B9DAFF',
      '200': '#A2CDFF',
      '300': '#7AB8FF',
      '400': '#2E90FF',
      '500': '#0078FF',
      '600': '#0063D1',
      '700': '#0052AC',
      '800': '#003C7E',
      '900': '#002C5C',
    },
    whatsapp: {
      '50': '#dffeec',
      '100': '#b9f5d0',
      '200': '#90edb3',
      '300': '#65e495',
      '400': '#3cdd78',
      '500': '#22c35e',
      '600': '#179848',
      '700': '#0c6c33',
      '800': '#01421c',
      '900': '#001803',
    },
    twitter: {
      '50': '#E5F4FD',
      '100': '#C8E9FB',
      '200': '#A8DCFA',
      '300': '#83CDF7',
      '400': '#57BBF5',
      '500': '#1DA1F2',
      '600': '#1A94DA',
      '700': '#1681BF',
      '800': '#136B9E',
      '900': '#0D4D71',
    },
    telegram: {
      '50': '#E3F2F9',
      '100': '#C5E4F3',
      '200': '#A2D4EC',
      '300': '#7AC1E4',
      '400': '#47A9DA',
      '500': '#0088CC',
      '600': '#007AB8',
      '700': '#006BA1',
      '800': '#005885',
      '900': '#003F5E',
    },
    border: {
      active: '#A09C98',
      danger: '#DD2222',
      default: '#ECEBEA',
      divider: '#ECEBEA',
      focus: '#7169EA',
      success: '#08A674',
    },
    brand: {
      '50': '#FFECE9',
      '100': '#FFDAD3',
      '200': '#FFB4A7',
      '300': '#FF8F7A',
      '400': '#FF694E',
      '500': '#F4502A',
      '600': '#DF320C',
      '700': '#C22B0A',
      '800': '#912108',
      '900': '#5C2012',
      default: '#F4502A',
      dark: '#DF320C',
    },
    faint: '#A09C98',
    grayBackground: '#FAFAFA',
    premium: {
      default: '#F4502A',
      gradient:
        'linear-gradient(72.07deg, #FE9B00 24.45%, #FD613B 58.24%, #FF4422 113.32%)',
    },
    primaryGreen: {
      '50': '#F2F7F6',
      '100': '#DDEEEB',
      '200': '#BBDDD8',
      '300': '#98CDC6',
      '400': '#75BDB5',
      '500': '#4EA298',
      '600': '#2F7F76',
      '700': '#15514D',
      '800': '#0D3735',
      '900': '#052625',
    },
    status: {
      danger: '#DD2222',
      hint: '#A09C98',
      info: '#0F65F0',
      success: '#08A674',
      warning: '#D97706',
      waiting: '#F66F6F',
    },
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  lineHeights: {
    '3': '.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: '2',
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
    default: 400,
  },
  fonts: {
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    body: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica-, Arial, sans-serif',
    mono: 'SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
    signature: "'Suomi', Script, cursive !important",
  },
  fontSizes: {
    '3xs': '0.45rem',
    '2xs': '0.625rem',
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
    xsmall: '11px',
    small: '12px',
    default: '13px',
    medium: '16px',
    large: '18px',
    xlarge: '22px',
  },
  sizes: {
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
    '36': '9rem',
    '40': '10rem',
    '44': '11rem',
    '48': '12rem',
    '52': '13rem',
    '56': '14rem',
    '60': '15rem',
    '64': '16rem',
    '72': '18rem',
    '80': '20rem',
    '96': '24rem',
    px: '1px',
    '0.5': '0.125rem',
    '1.5': '0.375rem',
    '2.5': '0.625rem',
    '3.5': '0.875rem',
    max: 'max-content',
    min: 'min-content',
    full: '100%',
    '3xs': '14rem',
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '90rem',
    prose: '60ch',
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    input: {
      xs: '92px',
      sm: '175px',
      md: '335px',
      lg: '580px',
      xsmall: '92px',
      small: '175px',
      medium: '335px',
      large: '580px',
    },
    layoutWidth: {
      md: '768px',
      lg: '1600px',
    },
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 1px rgba(23, 30, 37, 0.25), 0 0 1px rgba(23, 30, 37, 0.31)',
    md: '0 3px 5px rgba(23, 30, 37, 0.2), 0 0 1px rgba(23, 30, 37, 0.31)',
    lg: '0 8px 12px rgba(23, 30, 37, 0.15), 0 0 1px rgba(23, 30, 37, 0.31)',
    xl: '0 10px 18px rgba(23, 30, 37, 0.15), 0 0 1px rgba(23, 30, 37, 0.31)',
    '2xl': '0 18px 28px rgba(23, 30, 37, 0.15), 0 0 1px rgba(23, 30, 37, 0.31)',
    outline: '0 0 1px 2px rgba(113, 105, 234, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
    none: 'none',
    'dark-lg':
      'rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px',
  },
  space: {
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
    '36': '9rem',
    '40': '10rem',
    '44': '11rem',
    '48': '12rem',
    '52': '13rem',
    '56': '14rem',
    '60': '15rem',
    '64': '16rem',
    '72': '18rem',
    '80': '20rem',
    '96': '24rem',
    px: '1px',
    '0.5': '0.125rem',
    '1.5': '0.375rem',
    '2.5': '0.625rem',
    '3.5': '0.875rem',
    xsmall: '4px',
    small: '8px',
    medium: '12px',
    large: '16px',
    xlarge: '24px',
    xxlarge: '32px',
    form: '16px',
  },
  borders: {
    none: 0,
    '1px': '1px solid',
    '2px': '2px solid',
    '4px': '4px solid',
    '8px': '8px solid',
    default: '1px solid #F5F5F4',
  },
  transition: {
    property: {
      common:
        'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      dimensions: 'width, height',
      position: 'left, right, top, bottom',
      background: 'background-color, background-image, background-position',
    },
    easing: {
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      'ultra-fast': '50ms',
      faster: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      'ultra-slow': '500ms',
    },
  },
  components: {
    Accordion: {
      parts: [
        'button',
        'container',
        'title',
        'subtitle',
        'icon',
        'stepper',
        'stepperNumber',
        'stepperSuccess',
      ],
      baseStyle: {
        container: {
          borderTopWidth: '1px',
          borderColor: 'gray.200',
          _last: {
            borderBottomWidth: '1px',
          },
          backgroundColor: '#fff',
          borderRadius: 'default',
          borderWidth: '1px',
          transition: 'box-shadow 0.1s ease-in-out',
          _hover: {
            '&:not([data-readonly])': {
              boxShadow: 'md',
            },
          },
        },
        button: {
          transitionProperty: 'common',
          transitionDuration: 'normal',
          fontSize: 'md',
          _focusVisible: {
            boxShadow: 'outline',
          },
          _hover: {
            bg: 'blackAlpha.50',
            backgroundColor: 'transparent',
          },
          _disabled: {
            opacity: 0.4,
            cursor: 'not-allowed',
          },
          px: '4',
          py: 'medium',
          p: 'large',
          gridGap: 'large',
          position: 'relative',
          textAlign: 'left',
          _after: {
            content: '""',
            display: 'block',
            position: 'absolute',
            bottom: '0',
            left: 'large',
            right: 'large',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderColor: 'border.default',
            transition: 'opacity 0.1s ease-in-out',
            opacity: 0,
          },
          _expanded: {
            _after: {
              opacity: 1,
            },
          },
          _readOnly: {
            cursor: 'default',
          },
        },
        panel: {
          pt: 'large',
          px: 'large',
          pb: '5',
        },
        icon: {
          fontSize: '1.25em',
          ml: 'auto',
          p: 'small',
          my: '-xsmall',
          lineHeight: 0,
          _groupHover: {
            backgroundColor: 'gray.200',
            borderRadius: 'default',
          },
        },
        subtitle: {
          fontSize: 'small',
          color: 'gray.700',
        },
        stepper: {
          boxSize: '24px',
          lineHeight: 0,
        },
        stepperNumber: {
          fontWeight: 500,
          rounded: '50%',
          bgColor: 'gray.200',
          color: 'gray.500',
          boxSize: '100%',
        },
        stepperSuccess: {
          color: 'green.default',
          fontSize: '24px',
        },
      },
      sizes: {
        large: {
          iconPlus: {
            fontSize: '16px',
          },
          title: {
            fontSize: 'large',
            fontWeight: 'light',
          },
        },
        small: {
          title: {
            fontSize: 'default',
            fontWeight: '500',
          },
        },
      },
      defaultProps: {
        size: 'small',
      },
    },
    Alert: {
      parts: ['wrapper', 'iconSection', 'content', 'icon', 'spinner'],
      baseStyle: {
        container: {
          bg: 'var(--alert-bg)',
          px: '4',
          py: '3',
        },
        title: {
          fontWeight: 'bold',
          lineHeight: '6',
          marginEnd: '2',
        },
        description: {
          lineHeight: '6',
        },
        icon: {
          color: 'var(--alert-fg)',
          flexShrink: 0,
          marginEnd: '3',
          w: '5',
          h: '6',
        },
        spinner: {
          color: 'var(--alert-fg)',
          flexShrink: 0,
          marginEnd: '3',
          w: '5',
          h: '5',
        },
        iconSection: {
          lineHeight: 1.1,
        },
        content: {
          flex: '1',
        },
      },
      variants: {
        info: {
          wrapper: {
            background: 'blue.50',
          },
          iconSection: {
            color: 'status.info',
          },
        },
        warning: {
          wrapper: {
            background: 'yellow.50',
          },
          iconSection: {
            color: 'status.warning',
          },
        },
        danger: {
          wrapper: {
            background: 'red.50',
          },
          iconSection: {
            color: 'status.danger',
          },
        },
        success: {
          wrapper: {
            background: 'green.50',
          },
          iconSection: {
            color: 'status.success',
          },
        },
        premium: {
          wrapper: {
            background: 'purple.50',
          },
          iconSection: {
            color: 'purple.500',
          },
        },
      },
      defaultProps: {
        variant: 'subtle',
        colorScheme: 'blue',
      },
    },
    Avatar: {
      parts: ['container', 'badge', 'container', 'excessLabel', 'group'],
      sizes: {
        '2xs': {
          container: {
            '--avatar-size': '1rem',
            '--avatar-font-size': 'calc(1rem / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '1rem',
            '--avatar-font-size': 'calc(1rem / 2.5)',
          },
        },
        xs: {
          container: {
            '--avatar-size': '1.5rem',
            '--avatar-font-size': 'calc(1.5rem / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '1.5rem',
            '--avatar-font-size': 'calc(1.5rem / 2.5)',
          },
        },
        sm: {
          container: {
            '--avatar-size': '2rem',
            '--avatar-font-size': 'calc(2rem / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '2rem',
            '--avatar-font-size': 'calc(2rem / 2.5)',
          },
        },
        md: {
          container: {
            '--avatar-size': '3rem',
            '--avatar-font-size': 'calc(3rem / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '3rem',
            '--avatar-font-size': 'calc(3rem / 2.5)',
          },
        },
        lg: {
          container: {
            '--avatar-size': '4rem',
            '--avatar-font-size': 'calc(4rem / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '4rem',
            '--avatar-font-size': 'calc(4rem / 2.5)',
          },
        },
        xl: {
          container: {
            '--avatar-size': '6rem',
            '--avatar-font-size': 'calc(6rem / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '6rem',
            '--avatar-font-size': 'calc(6rem / 2.5)',
          },
        },
        '2xl': {
          container: {
            '--avatar-size': '8rem',
            '--avatar-font-size': 'calc(8rem / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '8rem',
            '--avatar-font-size': 'calc(8rem / 2.5)',
          },
        },
        full: {
          container: {
            '--avatar-size': '100%',
            '--avatar-font-size': 'calc(100% / 2.5)',
          },
          excessLabel: {
            '--avatar-size': '100%',
            '--avatar-font-size': 'calc(100% / 2.5)',
          },
        },
      },
      defaultProps: {
        size: 'md',
      },
    },
    Badge: {
      baseStyle: {
        px: 1,
        textTransform: 'none',
        fontSize: 'xs',
        borderRadius: '24px',
        fontWeight: 'medium',
        bg: 'var(--badge-bg)',
        color: 'var(--badge-color)',
        boxShadow: 'var(--badge-shadow)',
        paddingX: 'small',
        paddingY: '2px',
        display: 'inline-flex',
        alignItems: 'center',
      },
      variants: {},
      defaultProps: {
        variant: 'solid',
        colorScheme: 'gray',
        size: 'lg',
      },
      sizes: {
        sm: {
          fontSize: 'xs',
          height: '19px',
        },
        md: {
          fontSize: 'sm',
          height: '22px',
        },
        lg: {
          fontSize: 'md',
          height: '24px',
        },
      },
    },
    Breadcrumb: {
      parts: ['link', 'item', 'container', 'separator'],
      baseStyle: {
        link: {
          transitionProperty: 'common',
          transitionDuration: 'fast',
          transitionTimingFunction: 'ease-out',
          outline: 'none',
          color: 'inherit',
          textDecoration: 'var(--breadcrumb-link-decor)',
          '--breadcrumb-link-decor': 'none',
          '&:not([aria-current=page])': {
            cursor: 'pointer',
            _hover: {
              '--breadcrumb-link-decor': 'underline',
            },
            _focusVisible: {
              boxShadow: 'outline',
            },
          },
          _hover: {
            textDecoration: 'none',
          },
        },
      },
    },
    Button: {
      baseStyle: {
        lineHeight: '1.2',
        borderRadius: 'md',
        fontWeight: 'semibold',
        transitionProperty: 'common',
        transitionDuration: 'normal',
        _focusVisible: {
          boxShadow: 'outline',
        },
        _disabled: {
          opacity: 0.4,
          cursor: 'not-allowed',
          boxShadow: 'none',
        },
        _hover: {
          _disabled: {
            bg: 'initial',
          },
        },
      },
      variants: {
        unstyled: {
          bg: 'none',
          color: 'inherit',
          display: 'inline',
          lineHeight: 'inherit',
          m: '0',
          p: '0',
        },
      },
      sizes: {
        lg: {
          h: '12',
          minW: '12',
          fontSize: 'lg',
          px: '6',
        },
        md: {
          h: '10',
          minW: '10',
          fontSize: 'md',
          px: '4',
        },
        sm: {
          h: '8',
          minW: '8',
          fontSize: 'sm',
          px: '3',
        },
        xs: {
          h: '6',
          minW: '6',
          fontSize: 'xs',
          px: '2',
        },
      },
      defaultProps: {
        variant: 'solid',
        size: 'md',
        colorScheme: 'gray',
      },
    },
    Checkbox: {
      parts: ['control', 'icon', 'container', 'label'],
      sizes: {
        sm: {
          control: {
            '--checkbox-size': 'sizes.3',
          },
          label: {
            fontSize: 'sm',
          },
          icon: {
            fontSize: '3xs',
          },
        },
        md: {
          control: {
            '--checkbox-size': 'sizes.4',
          },
          label: {
            fontSize: 'md',
          },
          icon: {
            fontSize: '2xs',
          },
        },
        lg: {
          control: {
            '--checkbox-size': 'sizes.5',
          },
          label: {
            fontSize: 'lg',
          },
          icon: {
            fontSize: '2xs',
          },
        },
      },
      defaultProps: {
        size: 'md',
        colorScheme: 'purple',
      },
    },
    CloseButton: {
      baseStyle: {
        w: ['var(--close-button-size)'],
        h: ['var(--close-button-size)'],
        borderRadius: 'md',
        transitionProperty: 'common',
        transitionDuration: 'normal',
        _disabled: {
          opacity: 0.4,
          cursor: 'not-allowed',
          boxShadow: 'none',
        },
        _hover: {
          '--close-button-bg': 'colors.blackAlpha.100',
          _dark: {
            '--close-button-bg': 'colors.whiteAlpha.100',
          },
        },
        _active: {
          '--close-button-bg': 'colors.blackAlpha.200',
          _dark: {
            '--close-button-bg': 'colors.whiteAlpha.200',
          },
        },
        _focusVisible: {
          boxShadow: 'outline',
        },
        bg: 'var(--close-button-bg)',
      },
      sizes: {
        lg: {
          '--close-button-size': 'sizes.10',
          fontSize: 'md',
        },
        md: {
          '--close-button-size': 'sizes.8',
          fontSize: 'xs',
        },
        sm: {
          '--close-button-size': 'sizes.6',
          fontSize: '2xs',
        },
      },
      defaultProps: {
        size: 'md',
      },
    },
    Code: {
      baseStyle: {
        fontFamily: 'mono',
        fontSize: 'sm',
        px: '0.2em',
        borderRadius: 'sm',
        bg: 'var(--badge-bg)',
        color: 'var(--badge-color)',
        boxShadow: 'var(--badge-shadow)',
      },
      variants: {},
      defaultProps: {
        variant: 'subtle',
        colorScheme: 'gray',
      },
    },
    Container: {
      baseStyle: {
        w: '100%',
        mx: 'auto',
        maxW: 'prose',
        px: '4',
      },
    },
    Divider: {
      baseStyle: {
        opacity: 0.6,
        borderColor: 'border.default',
      },
      variants: {
        solid: {
          borderStyle: 'solid',
        },
        dashed: {
          borderStyle: 'dashed',
        },
        'dashed-long': {
          bgGradient: 'linear(to-r, border.default 50%, transparent 0%)',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'repeat-x',
          backgroundSize: '20px 2px',
          height: '2px',
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Drawer: {
      parts: [
        'overlay',
        'dialog',
        'dialog',
        'header',
        'closeButton',
        'body',
        'footer',
      ],
      sizes: {
        xs: {
          dialog: {
            maxW: 'xs',
          },
        },
        sm: {
          dialog: {
            maxW: 'md',
          },
        },
        md: {
          dialog: {
            maxW: 'lg',
          },
        },
        lg: {
          dialog: {
            maxW: '2xl',
          },
        },
        xl: {
          dialog: {
            maxW: '4xl',
          },
        },
        full: {
          dialog: {
            maxW: '100vw',
            h: '100vh',
          },
        },
        default: {
          dialog: {
            maxW: '700px',
          },
        },
      },
      defaultProps: {
        size: 'default',
      },
      variants: {
        white: {
          dialog: {
            backgroundColor: 'white',
          },
        },
      },
    },
    Editable: {
      parts: ['preview', 'input', 'textarea'],
      baseStyle: {
        preview: {
          borderRadius: 'md',
          py: '1',
          transitionProperty: 'common',
          transitionDuration: 'normal',
        },
        input: {
          borderRadius: 'md',
          py: '1',
          transitionProperty: 'common',
          transitionDuration: 'normal',
          width: 'full',
          _focusVisible: {
            boxShadow: 'outline',
          },
          _placeholder: {
            opacity: 0.6,
          },
        },
        textarea: {
          borderRadius: 'md',
          py: '1',
          transitionProperty: 'common',
          transitionDuration: 'normal',
          width: 'full',
          _focusVisible: {
            boxShadow: 'outline',
          },
          _placeholder: {
            opacity: 0.6,
          },
        },
      },
    },
    Form: {
      parts: ['helperText', 'container', 'helperText'],
    },
    FormError: {
      parts: ['text', 'icon'],
      baseStyle: {
        text: {
          '--form-error-color': 'colors.red.500',
          _dark: {
            '--form-error-color': 'colors.red.300',
          },
          color: 'var(--form-error-color)',
          mt: '2',
          fontSize: 'sm',
          lineHeight: 'normal',
        },
        icon: {
          marginEnd: '0.5em',
          '--form-error-color': 'colors.red.500',
          _dark: {
            '--form-error-color': 'colors.red.300',
          },
          color: 'var(--form-error-color)',
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: 'md',
        marginEnd: '3',
        mb: '2',
        fontWeight: 'medium',
        transitionProperty: 'common',
        transitionDuration: 'normal',
        opacity: 1,
        _disabled: {
          opacity: 0.4,
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: 'bold',
      },
      sizes: {
        '4xl': {
          fontSize: ['6xl', null, '7xl'],
          lineHeight: 1,
        },
        '3xl': {
          fontSize: ['5xl', null, '6xl'],
          lineHeight: 1,
        },
        '2xl': {
          fontSize: ['4xl', null, '5xl'],
          lineHeight: [1.2, null, 1],
        },
        xl: {
          fontSize: ['3xl', null, '4xl'],
          lineHeight: [1.33, null, 1.2],
        },
        lg: {
          fontSize: ['2xl', null, '3xl'],
          lineHeight: [1.33, null, 1.2],
        },
        md: {
          fontSize: 'xl',
          lineHeight: 1.2,
        },
        sm: {
          fontSize: 'md',
          lineHeight: 1.2,
        },
        xs: {
          fontSize: 'sm',
          lineHeight: 1.2,
        },
      },
      defaultProps: {
        size: 'xl',
      },
    },
    Input: {
      parts: ['addon', 'field', 'element', 'group'],
      baseStyle: {
        addon: {
          height: 'var(--input-height)',
          fontSize: 'var(--input-font-size)',
          px: 'var(--input-padding)',
          borderRadius: 'var(--input-border-radius)',
        },
        field: {
          width: '100%',
          height: 'var(--input-height)',
          fontSize: 'var(--input-font-size)',
          px: 'var(--input-padding)',
          borderRadius: 'var(--input-border-radius)',
          minWidth: 0,
          outline: 0,
          position: 'relative',
          appearance: 'none',
          transitionProperty: 'common',
          transitionDuration: 'normal',
          _disabled: {
            opacity: 0.4,
            cursor: 'not-allowed',
          },
        },
      },
      sizes: {
        lg: {
          field: {
            '--input-font-size': 'fontSizes.lg',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.12',
          },
          group: {
            '--input-font-size': 'fontSizes.lg',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.12',
          },
        },
        md: {
          field: {
            '--input-font-size': 'fontSizes.md',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.10',
          },
          group: {
            '--input-font-size': 'fontSizes.md',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.10',
          },
        },
        sm: {
          field: {
            '--input-font-size': 'fontSizes.sm',
            '--input-padding': 'space.3',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.8',
          },
          group: {
            '--input-font-size': 'fontSizes.sm',
            '--input-padding': 'space.3',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.8',
          },
        },
        xs: {
          field: {
            '--input-font-size': 'fontSizes.xs',
            '--input-padding': 'space.2',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.6',
          },
          group: {
            '--input-font-size': 'fontSizes.xs',
            '--input-padding': 'space.2',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.6',
          },
        },
        xl: {
          field: {
            fontSize: 'xl',
            px: '4',
            h: '12',
            borderRadius: 'md',
          },
        },
      },
      variants: {
        unstyled: {
          field: {
            bg: 'transparent',
            px: '0',
            height: 'auto',
          },
          addon: {
            bg: 'transparent',
            px: '0',
            height: 'auto',
          },
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'outline',
      },
    },
    Kbd: {
      baseStyle: {
        '--kbd-bg': 'colors.gray.100',
        _dark: {
          '--kbd-bg': 'colors.whiteAlpha.100',
        },
        bg: 'var(--kbd-bg)',
        borderRadius: 'md',
        borderWidth: '1px',
        borderBottomWidth: '3px',
        fontSize: '0.8em',
        fontWeight: 'bold',
        lineHeight: 'normal',
        px: '0.4em',
        whiteSpace: 'nowrap',
      },
    },
    Link: {
      baseStyle: {
        transitionProperty: 'common',
        transitionDuration: 'fast',
        transitionTimingFunction: 'ease-out',
        cursor: 'pointer',
        textDecoration: 'none',
        outline: 'none',
        color: 'inherit',
        _hover: {
          textDecoration: 'underline',
        },
        _focusVisible: {
          boxShadow: 'outline',
        },
      },
    },
    List: {
      parts: ['container', 'item', 'icon'],
      baseStyle: {
        icon: {
          marginEnd: '2',
          display: 'inline',
          verticalAlign: 'text-bottom',
        },
      },
    },
    Menu: {
      parts: [
        'list',
        'item',
        'item',
        'groupTitle',
        'icon',
        'command',
        'divider',
      ],
      baseStyle: {
        button: {
          transitionProperty: 'common',
          transitionDuration: 'normal',
        },
        list: {
          '--menu-bg': '#fff',
          '--menu-shadow': 'shadows.sm',
          _dark: {
            '--menu-bg': 'colors.gray.700',
            '--menu-shadow': 'shadows.dark-lg',
          },
          color: 'inherit',
          minW: '3xs',
          py: 'small',
          zIndex: 1,
          borderRadius: 'default',
          borderWidth: '1px',
          bg: 'var(--menu-bg)',
          boxShadow: 'lg',
        },
        item: {
          py: 'small',
          px: 'large',
          transitionProperty: 'background',
          transitionDuration: 'ultra-fast',
          transitionTimingFunction: 'ease-in',
          _focus: {
            '--menu-bg': 'colors.gray.100',
            _dark: {
              '--menu-bg': 'colors.whiteAlpha.100',
            },
            backgroundColor: 'white',
          },
          _active: {
            '--menu-bg': 'colors.gray.200',
            _dark: {
              '--menu-bg': 'colors.whiteAlpha.200',
            },
            backgroundColor: 'purple.100',
          },
          _expanded: {
            '--menu-bg': 'colors.gray.100',
            _dark: {
              '--menu-bg': 'colors.whiteAlpha.100',
            },
          },
          _disabled: {
            opacity: 0.4,
            cursor: 'not-allowed',
          },
          bg: 'var(--menu-bg)',
          _hover: {
            backgroundColor: 'gray.200',
          },
        },
        groupTitle: {
          mx: 'medium',
          my: 2,
          fontWeight: 'semibold',
          fontSize: 'xsmall',
          color: 'gray.500',
          textTransform: 'uppercase',
          mt: 'medium',
        },
        icon: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        command: {
          opacity: 0.6,
        },
        divider: {
          border: 0,
          borderBottom: '1px solid',
          borderColor: 'inherit',
          my: '2',
          opacity: 0.6,
        },
      },
    },
    Modal: {
      parts: [
        'body',
        'dialog',
        'footer',
        'header',
        'closeButton',
        'body',
        'footer',
      ],
      sizes: {
        xs: {
          dialog: {
            maxW: 'xs',
          },
        },
        sm: {
          dialog: {
            maxW: 'sm',
          },
        },
        md: {
          dialog: {
            maxW: 'md',
          },
        },
        lg: {
          dialog: {
            maxW: 'lg',
          },
        },
        xl: {
          dialog: {
            maxW: 'xl',
          },
        },
        '2xl': {
          dialog: {
            maxW: '2xl',
          },
        },
        '3xl': {
          dialog: {
            maxW: '3xl',
          },
        },
        '4xl': {
          dialog: {
            maxW: '4xl',
          },
        },
        '5xl': {
          dialog: {
            maxW: '5xl',
          },
        },
        '6xl': {
          dialog: {
            maxW: '95%',
          },
        },
        full: {
          dialog: {
            maxW: '100vw',
            minH: '$100vh',
            my: '0',
            borderRadius: '0',
          },
        },
      },
      defaultProps: {
        size: 'md',
      },
    },
    NumberInput: {
      parts: ['root', 'field', 'stepperGroup', 'stepper'],
      sizes: {
        xs: {
          field: {
            '--input-font-size': 'fontSizes.xs',
            '--input-padding': 'space.2',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.6',
            paddingInlineEnd: 'var(--number-input-input-padding)',
            verticalAlign: 'top',
          },
          stepper: {
            fontSize: 'calc(1rem * 0.75)',
            _first: {
              borderTopEndRadius: 'sm',
            },
            _last: {
              borderBottomEndRadius: 'sm',
              mt: '-1px',
              borderTopWidth: 1,
            },
          },
        },
        sm: {
          field: {
            '--input-font-size': 'fontSizes.sm',
            '--input-padding': 'space.3',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.8',
            paddingInlineEnd: 'var(--number-input-input-padding)',
            verticalAlign: 'top',
          },
          stepper: {
            fontSize: 'calc(1rem * 0.75)',
            _first: {
              borderTopEndRadius: 'sm',
            },
            _last: {
              borderBottomEndRadius: 'sm',
              mt: '-1px',
              borderTopWidth: 1,
            },
          },
        },
        md: {
          field: {
            '--input-font-size': 'fontSizes.md',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.10',
            paddingInlineEnd: 'var(--number-input-input-padding)',
            verticalAlign: 'top',
          },
          stepper: {
            fontSize: 'calc(1rem * 0.75)',
            _first: {
              borderTopEndRadius: 'md',
            },
            _last: {
              borderBottomEndRadius: 'md',
              mt: '-1px',
              borderTopWidth: 1,
            },
          },
        },
        lg: {
          field: {
            '--input-font-size': 'fontSizes.lg',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.12',
            paddingInlineEnd: 'var(--number-input-input-padding)',
            verticalAlign: 'top',
          },
          stepper: {
            fontSize: 'calc(1rem * 0.75)',
            _first: {
              borderTopEndRadius: 'md',
            },
            _last: {
              borderBottomEndRadius: 'md',
              mt: '-1px',
              borderTopWidth: 1,
            },
          },
        },
      },
      variants: {
        unstyled: {
          field: {
            bg: 'transparent',
            px: '0',
            height: 'auto',
          },
          addon: {
            bg: 'transparent',
            px: '0',
            height: 'auto',
          },
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'outline',
      },
    },
    PinInput: {
      baseStyle: {
        width: '100%',
        height: 'var(--input-height)',
        fontSize: 'var(--input-font-size)',
        px: 'var(--input-padding)',
        borderRadius: 'var(--input-border-radius)',
        minWidth: 0,
        outline: 0,
        position: 'relative',
        appearance: 'none',
        transitionProperty: 'common',
        transitionDuration: 'normal',
        _disabled: {
          opacity: 0.4,
          cursor: 'not-allowed',
        },
        textAlign: 'center',
      },
      sizes: {
        lg: {
          fontSize: 'lg',
          w: 12,
          h: 12,
          borderRadius: 'md',
        },
        md: {
          fontSize: 'md',
          w: 10,
          h: 10,
          borderRadius: 'md',
        },
        sm: {
          fontSize: 'sm',
          w: 8,
          h: 8,
          borderRadius: 'sm',
        },
        xs: {
          fontSize: 'xs',
          w: 6,
          h: 6,
          borderRadius: 'sm',
        },
      },
      variants: {
        unstyled: {
          bg: 'transparent',
          px: '0',
          height: 'auto',
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'outline',
      },
    },
    Popover: {
      parts: [
        'content',
        'header',
        'body',
        'footer',
        'popper',
        'arrow',
        'closeButton',
      ],
      baseStyle: {
        popper: {
          zIndex: 10,
        },
        content: {
          '--popper-bg': 'colors.white',
          bg: 'var(--popper-bg)',
          '--popper-arrow-bg': 'var(--popper-bg)',
          '--popper-arrow-shadow-color': 'colors.gray.200',
          _dark: {
            '--popper-bg': 'colors.gray.700',
            '--popper-arrow-shadow-color': 'colors.whiteAlpha.300',
          },
          width: 'xs',
          border: '1px solid',
          borderColor: 'gray.200',
          borderRadius: 'md',
          boxShadow: 'lg',
          zIndex: 'inherit',
          _focusVisible: {
            outline: 0,
            boxShadow: 'outline',
          },
          margin: 'medium',
        },
        header: {
          px: 3,
          py: 2,
          borderBottomWidth: '1px',
        },
        body: {
          px: 'large',
          py: 'large',
        },
        footer: {
          px: 3,
          py: 2,
          borderTopWidth: '1px',
        },
        closeButton: {
          position: 'absolute',
          borderRadius: 'md',
          top: 1,
          insetEnd: 2,
          padding: 2,
        },
      },
      sizes: {
        small: {
          content: {
            width: '240px',
          },
        },
        medium: {
          content: {
            width: '320px',
          },
        },
        large: {
          content: {
            width: '400px',
          },
        },
      },
    },
    Progress: {
      parts: ['track', 'filledTrack', 'track'],
      sizes: {
        xs: {
          track: {
            h: '1',
          },
        },
        sm: {
          track: {
            h: '2',
          },
        },
        md: {
          track: {
            h: '3',
          },
        },
        lg: {
          track: {
            h: '4',
          },
        },
      },
      defaultProps: {
        size: 'md',
        colorScheme: 'primaryGreen',
      },
    },
    Radio: {
      parts: ['control', 'control', 'label'],
      sizes: {
        md: {
          control: {
            w: '4',
            h: '4',
          },
          label: {
            fontSize: 'md',
          },
        },
        lg: {
          control: {
            w: '5',
            h: '5',
          },
          label: {
            fontSize: 'lg',
          },
        },
        sm: {
          control: {
            width: '3',
            height: '3',
          },
          label: {
            fontSize: 'sm',
          },
        },
      },
      defaultProps: {
        size: 'md',
        colorScheme: 'purple',
      },
    },
    Select: {
      parts: ['field', 'icon'],
      baseStyle: {
        field: {
          width: '100%',
          height: 'var(--input-height)',
          fontSize: 'var(--input-font-size)',
          px: 'var(--input-padding)',
          borderRadius: 'var(--input-border-radius)',
          minWidth: 0,
          outline: 0,
          position: 'relative',
          appearance: 'none',
          transitionProperty: 'common',
          transitionDuration: 'normal',
          _disabled: {
            opacity: 0.4,
            cursor: 'not-allowed',
          },
          paddingBottom: '1px',
          lineHeight: 'normal',
          bg: 'var(--select-bg)',
          '--select-bg': 'colors.white',
          _dark: {
            '--select-bg': 'colors.gray.700',
          },
          '> option, > optgroup': {
            bg: 'var(--select-bg)',
          },
        },
        icon: {
          width: '6',
          height: '100%',
          insetEnd: '2',
          position: 'relative',
          color: 'currentColor',
          fontSize: 'xl',
          _disabled: {
            opacity: 0.5,
          },
        },
      },
      sizes: {
        lg: {
          field: {
            '--input-font-size': 'fontSizes.lg',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.12',
            paddingInlineEnd: '8',
          },
          group: {
            '--input-font-size': 'fontSizes.lg',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.12',
          },
        },
        md: {
          field: {
            '--input-font-size': 'fontSizes.md',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.10',
            paddingInlineEnd: '8',
          },
          group: {
            '--input-font-size': 'fontSizes.md',
            '--input-padding': 'space.4',
            '--input-border-radius': 'radii.md',
            '--input-height': 'sizes.10',
          },
        },
        sm: {
          field: {
            '--input-font-size': 'fontSizes.sm',
            '--input-padding': 'space.3',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.8',
            paddingInlineEnd: '8',
          },
          group: {
            '--input-font-size': 'fontSizes.sm',
            '--input-padding': 'space.3',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.8',
          },
        },
        xs: {
          field: {
            '--input-font-size': 'fontSizes.xs',
            '--input-padding': 'space.2',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.6',
            paddingInlineEnd: '8',
          },
          group: {
            '--input-font-size': 'fontSizes.xs',
            '--input-padding': 'space.2',
            '--input-border-radius': 'radii.sm',
            '--input-height': 'sizes.6',
          },
          icon: {
            insetEnd: '1',
          },
        },
      },
      variants: {
        unstyled: {
          field: {
            bg: 'transparent',
            px: '0',
            height: 'auto',
          },
          addon: {
            bg: 'transparent',
            px: '0',
            height: 'auto',
          },
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'outline',
      },
    },
    Skeleton: {
      baseStyle: {
        '--skeleton-start-color': 'colors.gray.100',
        '--skeleton-end-color': 'colors.gray.400',
        _dark: {
          '--skeleton-start-color': 'colors.gray.800',
          '--skeleton-end-color': 'colors.gray.600',
        },
        background: 'var(--skeleton-start-color)',
        borderColor: 'var(--skeleton-end-color)',
        opacity: 0.7,
        borderRadius: 'large',
      },
      defaultProps: {
        startColor: 'gray.50',
        endColor: 'gray.200',
      },
    },
    SkipLink: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: 'semibold',
        _focusVisible: {
          boxShadow: 'outline',
          padding: '4',
          position: 'fixed',
          top: '6',
          insetStart: '6',
          '--skip-link-bg': 'colors.white',
          _dark: {
            '--skip-link-bg': 'colors.gray.700',
          },
          bg: 'var(--skip-link-bg)',
        },
      },
    },
    Slider: {
      parts: ['container', 'track', 'thumb', 'filledTrack', 'mark'],
      sizes: {
        lg: {
          container: {
            '--slider-thumb-size': 'sizes.4',
            '--slider-track-size': 'sizes.1',
          },
        },
        md: {
          container: {
            '--slider-thumb-size': 'sizes.3.5',
            '--slider-track-size': 'sizes.1',
          },
        },
        sm: {
          container: {
            '--slider-thumb-size': 'sizes.2.5',
            '--slider-track-size': 'sizes.0.5',
          },
        },
      },
      defaultProps: {
        size: 'md',
        colorScheme: 'blue',
      },
    },
    Spinner: {
      baseStyle: {
        width: ['var(--spinner-size)'],
        height: ['var(--spinner-size)'],
        color: 'brand.500',
      },
      sizes: {
        xs: {
          '--spinner-size': 'sizes.3',
        },
        sm: {
          '--spinner-size': 'sizes.4',
        },
        md: {
          '--spinner-size': 'sizes.6',
        },
        lg: {
          '--spinner-size': 'sizes.8',
        },
        xl: {
          '--spinner-size': 'sizes.12',
        },
      },
      defaultProps: {
        size: 'xl',
      },
    },
    Stat: {
      parts: ['container', 'label', 'helpText', 'number', 'icon'],
      baseStyle: {
        container: {},
        label: {
          fontWeight: 'medium',
        },
        helpText: {
          opacity: 0.8,
          marginBottom: '2',
        },
        number: {
          verticalAlign: 'baseline',
          fontWeight: 'semibold',
        },
        icon: {
          marginEnd: 1,
          w: '3.5',
          h: '3.5',
          verticalAlign: 'middle',
        },
      },
      sizes: {
        md: {
          label: {
            fontSize: 'sm',
          },
          helpText: {
            fontSize: 'sm',
          },
          number: {
            fontSize: '2xl',
          },
        },
      },
      defaultProps: {
        size: 'md',
      },
    },
    Switch: {
      parts: ['container', 'track', 'thumb', 'label'],
      sizes: {
        sm: {
          container: {
            '--switch-track-width': '1.8465rem',
            '--switch-track-height': '0.9235rem',
          },
          track: {
            padding: '1px',
          },
          thumb: {
            height: '12px',
            width: '12px',
          },
        },
        md: {
          container: {
            '--switch-track-width': '2.462rem',
            '--switch-track-height': '1.231rem',
          },
        },
        lg: {
          container: {
            '--switch-track-width': '3.539rem',
            '--switch-track-height': '1.539rem',
          },
        },
      },
      defaultProps: {
        size: 'lg',
        colorScheme: 'green',
      },
    },
    Table: {
      parts: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'tfoot', 'caption'],
      baseStyle: {
        table: {
          fontVariantNumeric: 'lining-nums tabular-nums',
          borderCollapse: 'collapse',
          width: 'full',
        },
        th: {
          fontFamily: 'heading',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 'wider',
          textAlign: 'start',
        },
        td: {
          textAlign: 'start',
        },
        caption: {
          mt: 4,
          fontFamily: 'heading',
          textAlign: 'center',
          fontWeight: 'medium',
        },
      },
      variants: {
        unstyled: {},
        list: {
          table: {
            borderCollapse: 'separate',
            borderSpacing: '0 6px',
            tableLayout: 'auto',
          },
          th: {
            borderColor: 'none',
            color: 'gray.500',
            fontWeight: 'normal',
            textAlign: 'right',
            verticalAlign: 'top',
            whiteSpace: 'nowrap',
            width: '1px',
            textTransform: 'none',
            fontSize: 'default',
            letterSpacing: 'inherit',
            lineHeight: 'base',
            p: '5px 10px',
          },
          td: {
            lineHeight: 'base',
            p: '5px 10px',
          },
        },
      },
      sizes: {
        sm: {
          th: {
            px: '4',
            py: '1',
            lineHeight: '4',
            fontSize: 'xs',
          },
          td: {
            px: '4',
            py: '2',
            fontSize: 'sm',
            lineHeight: '4',
          },
          caption: {
            px: '4',
            py: '2',
            fontSize: 'xs',
          },
        },
        md: {
          th: {
            px: 'medium',
            py: '3',
            lineHeight: '4',
            fontSize: '11px',
          },
          td: {
            px: 'medium',
            py: '4',
            lineHeight: '5',
          },
          caption: {
            px: '6',
            py: '2',
            fontSize: 'sm',
          },
        },
        lg: {
          th: {
            px: '8',
            py: '4',
            lineHeight: '5',
            fontSize: 'sm',
          },
          td: {
            px: '8',
            py: '5',
            lineHeight: '6',
          },
          caption: {
            px: '6',
            py: '2',
            fontSize: 'md',
          },
        },
      },
      defaultProps: {
        variant: 'simple',
        size: 'md',
        colorScheme: 'gray',
      },
    },
    Tabs: {
      parts: [
        'tab',
        'tablist',
        'tablist',
        'tabpanel',
        'tabpanels',
        'indicator',
      ],
      sizes: {
        sm: {
          tab: {
            py: 1,
            px: 4,
            fontSize: 'sm',
          },
        },
        md: {
          tab: {
            fontSize: 'md',
            py: 2,
            px: 4,
          },
        },
        lg: {
          tab: {
            fontSize: 'lg',
            py: 3,
            px: 4,
          },
        },
      },
      variants: {
        unstyled: {},
      },
      defaultProps: {
        size: 'md',
        variant: 'line',
        colorScheme: 'blue',
      },
    },
    Tag: {
      parts: ['container', 'label', 'closeButton'],
      variants: {},
      baseStyle: {
        container: {
          fontWeight: 'medium',
          lineHeight: 1.2,
          outline: 0,
          '--tag-color': 'var(--badge-color)',
          '--tag-bg': 'var(--badge-bg)',
          '--tag-shadow': 'var(--badge-shadow)',
          color: 'var(--tag-color)',
          bg: 'var(--tag-bg)',
          boxShadow: 'var(--tag-shadow)',
          borderRadius: 'md',
          minH: 'var(--tag-min-height)',
          minW: 'var(--tag-min-width)',
          fontSize: 'var(--tag-font-size)',
          px: 'var(--tag-padding-inline)',
          _focusVisible: {
            '--tag-shadow': 'shadows.outline',
          },
        },
        label: {
          lineHeight: 1.2,
          overflow: 'visible',
        },
        closeButton: {
          fontSize: 'lg',
          w: '5',
          h: '5',
          transitionProperty: 'common',
          transitionDuration: 'normal',
          borderRadius: 'full',
          marginStart: '1.5',
          marginEnd: '-1',
          opacity: 0.5,
          _disabled: {
            opacity: 0.4,
          },
          _focusVisible: {
            boxShadow: 'outline',
            bg: 'rgba(0, 0, 0, 0.14)',
          },
          _hover: {
            opacity: 0.8,
          },
          _active: {
            opacity: 1,
          },
        },
      },
      sizes: {
        sm: {
          container: {
            '--tag-min-height': 'sizes.5',
            '--tag-min-width': 'sizes.5',
            '--tag-font-size': 'fontSizes.xs',
            '--tag-padding-inline': 'space.2',
          },
          closeButton: {
            marginEnd: '-2px',
            marginStart: '0.35rem',
          },
        },
        md: {
          container: {
            '--tag-min-height': 'sizes.6',
            '--tag-min-width': 'sizes.6',
            '--tag-font-size': 'fontSizes.sm',
            '--tag-padding-inline': 'space.2',
          },
        },
        lg: {
          container: {
            '--tag-min-height': 'sizes.8',
            '--tag-min-width': 'sizes.8',
            '--tag-font-size': 'fontSizes.md',
            '--tag-padding-inline': 'space.3',
          },
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'subtle',
        colorScheme: 'gray',
      },
    },
    Textarea: {
      baseStyle: {
        width: '100%',
        height: 'var(--input-height)',
        fontSize: 'var(--input-font-size)',
        px: 'var(--input-padding)',
        borderRadius: 'var(--input-border-radius)',
        minWidth: 0,
        outline: 0,
        position: 'relative',
        appearance: 'none',
        transitionProperty: 'common',
        transitionDuration: 'normal',
        _disabled: {
          opacity: 0.4,
          cursor: 'not-allowed',
        },
        paddingY: '2',
        minHeight: '20',
        lineHeight: 'short',
        verticalAlign: 'top',
      },
      sizes: {
        xs: {
          '--input-font-size': 'fontSizes.xs',
          '--input-padding': 'space.2',
          '--input-border-radius': 'radii.sm',
          '--input-height': 'sizes.6',
        },
        sm: {
          '--input-font-size': 'fontSizes.sm',
          '--input-padding': 'space.3',
          '--input-border-radius': 'radii.sm',
          '--input-height': 'sizes.8',
        },
        md: {
          '--input-font-size': 'fontSizes.md',
          '--input-padding': 'space.4',
          '--input-border-radius': 'radii.md',
          '--input-height': 'sizes.10',
        },
        lg: {
          '--input-font-size': 'fontSizes.lg',
          '--input-padding': 'space.4',
          '--input-border-radius': 'radii.md',
          '--input-height': 'sizes.12',
        },
      },
      variants: {
        unstyled: {
          bg: 'transparent',
          px: '0',
          height: 'auto',
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'outline',
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'var(--tooltip-bg)',
        color: 'var(--tooltip-fg)',
        '--tooltip-bg': 'colors.gray.700',
        '--tooltip-fg': 'colors.whiteAlpha.900',
        _dark: {
          '--tooltip-bg': 'colors.gray.300',
          '--tooltip-fg': 'colors.gray.900',
        },
        '--popper-arrow-bg': 'var(--tooltip-bg)',
        px: '2',
        py: '0.5',
        borderRadius: 'sm',
        fontWeight: 'medium',
        fontSize: 'sm',
        boxShadow: 'md',
        maxW: 'xs',
        zIndex: 'tooltip',
      },
    },
    Card: {
      parts: ['card', 'cardContent', 'cardHeader', 'cardFooter'],
      baseStyle: {
        container: {
          '--card-bg': 'colors.chakra-body-bg',
          backgroundColor: 'var(--card-bg)',
          boxShadow: 'var(--card-shadow)',
          borderRadius: 'var(--card-radius)',
          color: 'chakra-body-text',
          borderWidth: 'var(--card-border-width, 0)',
          borderColor: 'var(--card-border-color)',
        },
        body: {
          padding: 'var(--card-padding)',
          flex: '1 1 0%',
        },
        header: {
          padding: 'var(--card-padding)',
        },
        footer: {
          padding: 'var(--card-padding)',
        },
        card: {
          position: 'relative',
          _after: {
            borderRadius: 'default',
            boxShadow: 'lg',
            content: '""',
            height: '100%',
            opacity: 0,
            position: 'absolute',
            top: 0,
            transition: 'opacity 0.15s ease-in',
            width: '100%',
            zIndex: -1,
          },
          backgroundColor: '#fff',
          border: '1px',
          borderColor: 'border.default',
          borderRadius: 'default',
          transition: 'transform 0.15s ease-out',
        },
        cardContent: {
          height: '100%',
          padding: 'large',
        },
        cardHeader: {
          backgroundColor: 'purple.50',
          borderBottom: 'default',
          overflow: 'clip',
        },
        cardFooter: {
          alignItems: 'center',
          backgroundColor: '#fff',
          borderTop: 'default',
          display: 'flex',
          justifyContent: 'center',
        },
      },
      variants: {
        elevated: {
          container: {
            '--card-shadow': 'shadows.base',
            _dark: {
              '--card-bg': 'colors.gray.700',
            },
          },
        },
        outline: {
          container: {
            '--card-border-width': '1px',
            '--card-border-color': 'colors.chakra-border-color',
          },
        },
        filled: {
          container: {
            '--card-bg': 'colors.chakra-subtle-bg',
          },
        },
        unstyled: {
          body: {
            '--card-padding': 0,
          },
          header: {
            '--card-padding': 0,
          },
          footer: {
            '--card-padding': 0,
          },
        },
      },
      sizes: {
        sm: {
          container: {
            '--card-radius': 'radii.base',
            '--card-padding': 'space.3',
          },
        },
        md: {
          container: {
            '--card-radius': 'radii.md',
            '--card-padding': 'space.5',
          },
        },
        lg: {
          container: {
            '--card-radius': 'radii.xl',
            '--card-padding': 'space.7',
          },
        },
      },
      defaultProps: {
        variant: 'elevated',
        size: 'md',
      },
    },
    Stepper: {
      parts: [
        'stepper',
        'step',
        'title',
        'description',
        'indicator',
        'separator',
        'icon',
        'number',
      ],
      sizes: {
        xs: {
          stepper: {
            '--stepper-indicator-size': 'sizes.4',
            '--stepper-icon-size': 'sizes.3',
            '--stepper-title-font-size': 'fontSizes.xs',
            '--stepper-description-font-size': 'fontSizes.xs',
          },
        },
        sm: {
          stepper: {
            '--stepper-indicator-size': 'sizes.6',
            '--stepper-icon-size': 'sizes.4',
            '--stepper-title-font-size': 'fontSizes.sm',
            '--stepper-description-font-size': 'fontSizes.xs',
          },
        },
        md: {
          stepper: {
            '--stepper-indicator-size': 'sizes.8',
            '--stepper-icon-size': 'sizes.5',
            '--stepper-title-font-size': 'fontSizes.md',
            '--stepper-description-font-size': 'fontSizes.sm',
          },
        },
        lg: {
          stepper: {
            '--stepper-indicator-size': 'sizes.10',
            '--stepper-icon-size': 'sizes.6',
            '--stepper-title-font-size': 'fontSizes.lg',
            '--stepper-description-font-size': 'fontSizes.md',
          },
        },
      },
      defaultProps: {
        size: 'md',
        colorScheme: 'blue',
      },
    },
    AccentCard: {
      parts: ['card', 'content', 'header'],
      baseStyle: {
        card: {
          backgroundColor: '#fff',
          borderRadius: 'large',
          boxShadow: 'xl',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        },
        content: {
          flex: 1,
          height: '100%',
          overflow: 'auto',
          paddingX: 'xlarge',
          paddingY: 'xxlarge',
        },
        header: {
          borderBottom: 'default',
        },
      },
    },
    DatePicker: {
      baseStyle: {
        display: 'inline-block',
        '.rdp': {
          margin: 0,
        },
        '.rdp-caption': {
          marginBottom: '3px',
        },
        '.rdp-caption_label': {
          fontSize: '21px',
          color: 'gray.900',
          fontWeight: 'medium',
        },
        '.rdp-nav_icon': {
          width: '12px',
        },
        '.rdp-head_cell': {
          fontSize: 'default',
          fontWeight: 'medium',
          textTransform: 'capitalize',
        },
        '.rdp-day': {
          color: 'gray.800',
          fontSize: 'default',
          '&_disabled': {
            color: 'gray.500',
          },
          '&_selected': {
            color: 'white',
          },
          '&_today': {
            color: 'purple.500',
            fontWeight: 'bold',
            '&.rdp-day_selected': {
              color: 'white',
            },
          },
          '&_selected:not(.rdp-day_disabled):not(.rdp-day_outside)': {
            backgroundColor: 'purple.500',
            _hover: {
              backgroundColor: 'purple.500',
            },
            _active: {
              backgroundColor: 'purple.500',
            },
          },
        },
        '.rdp-day:not(.rdp-day_disabled):not(.rdp-day_selected):not(.rdp-day_outside)':
        {
          _hover: {
            backgroundColor: 'gray.50',
          },
          _active: {
            backgroundColor: 'purple.50',
          },
        },
      },
    },
    HtmlContent,
    Page: {
      baseStyle: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'all 0.5s ease-in-out',
      },
    },
    PageContent: {
      baseStyle: {
        height: '100%',
        overflowY: 'scroll',
        paddingY: 'large',
        paddingX: 'xlarge',
      },
      variants: {
        white: {
          background: '#fff',
        },
        gray: {
          background: 'grayBackground',
        },
        gradient: {
          background:
            'linear-gradient(\n          140deg,\n          rgba(254, 155, 0, 0.15) 0%,\n          rgba(253, 97, 59, 0.15) 37.33%,\n          rgba(255, 68, 34, 0.15) 99.55%\n        ),\n        linear-gradient(180deg, #ffffff 0%, #ffffff 100%)',
          mixBlendMode: 'normal',
        },
      },
      defaultProps: {
        variant: 'white',
      },
    },
    PageHeader: {
      baseStyle: {
        backgroundColor: '#fff',
        borderBottom: '1px',
        borderBottomColor: 'gray.200',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'large',
        justifyContent: 'space-between',
        paddingX: 'xlarge',
        paddingY: 'large',
      },
    },
    RichTextEditor: {
      baseStyle: {
        '.ck.ck-heading_paragraph, .ck.ck-heading_heading1, .ck.ck-heading_heading2, .ck.ck-heading_heading3, .ck.ck-heading_heading4':
        {
          padding: '4px 10px !important',
        },
        '.ck.ck-heading_heading1': {
          fontSize: '24px',
          fontWeight: '500',
        },
        '.ck.ck-heading_heading2': {
          fontSize: '20px',
          fontWeight: '500',
        },
        '.ck.ck-heading_heading3': {
          fontSize: '16px',
          fontWeight: '600',
        },
        '.ck.ck-heading_heading4': {
          fontSize: '14px',
          fontWeight: '600',
        },
        '.ck.ck-heading_paragraph': {
          fontSize: '14px',
        },
        '.ck.ck-heading_signature .ck-button__label': {
          fontFamily: 'signature',
          fontSize: '30px',
          fontWeight: 'bold',
          lineHeight: 1,
        },
        '.ck.ck-heading_signature-medium .ck-button__label': {
          fontFamily: 'signature',
          fontSize: '20px',
          fontWeight: 'bold',
          lineHeight: 1,
        },
        '.ck.ck-heading_signature-small .ck-button__label': {
          fontFamily: 'signature',
          fontSize: '14px',
          fontWeight: 'bold',
          lineHeight: 1,
        },
        '.ck.ck-file-dialog-button+.ck-splitbutton__arrow': {
          background: 'transparent',
          position: 'absolute',
          inset: '0',
          ':not(.ck-disabled)': {
            ':after': {
              width: '0',
            },
            ':hover': {
              background: 'transparent',
            },
            svg: {
              opacity: '0',
            },
          },
        },
      },
    },
    Text: {
      variants: {
        h1: {
          color: 'gray.900',
          fontSize: 'xlarge',
          fontWeight: 'default',
          marginBottom: 'large',
        },
        h2: {
          fontSize: 'large',
          fontWeight: 'default',
          marginBottom: 'medium',
        },
        h3: {
          fontSize: 'large',
          fontWeight: 'light',
          marginBottom: 'small',
        },
        h4: {
          fontSize: 'medium',
          fontWeight: 'default',
          marginBottom: 'xsmall',
        },
        body: {
          fontSize: 'default',
          fontWeight: 'default',
        },
        paragraph: {
          fontSize: 'default',
          fontWeight: 'default',
          marginBottom: 'medium',
        },
        small: {
          fontSize: 'small',
          fontWeight: 'default',
        },
        xsmall: {
          fontSize: 'xsmall',
          fontWeight: 'light',
        },
      },
    },
  },
  styles: {},
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
    cssVarPrefix: 'chakra',
  },
});
