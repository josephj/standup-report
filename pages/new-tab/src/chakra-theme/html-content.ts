import { defineStyleConfig } from '@chakra-ui/react';

export const HtmlContent = defineStyleConfig({
  baseStyle: {
    a: {
      color: 'purple.500',
      _hover: {
        color: 'purple.700',
      },
    },
    hr: {
      border: 'default',
      mt: 'medium',
    },
    'p, li, td, th, blockquote': {
      fontSize: '14px',
    },
    'ul, ol': {
      paddingInlineStart: '30px',
      marginBlockStart: '1em',
      marginBlockEnd: '1em',
      'ul, ol': {
        paddingInlineStart: '20px',
        marginBlockStart: '0.5em',
        marginBlockEnd: '0.5em',
      },
    },
    ul: {
      listStyleType: 'disc',
      ul: {
        listStyleType: 'circle',
        ul: {
          listStyleType: 'square',
        },
      },
    },
    ol: {
      listStyleType: 'decimal',
      ol: {
        listStyleType: 'lower-latin',
        ol: {
          listStyleType: 'lower-roman',
          ol: {
            listStyleType: 'upper-latin',
            ol: {
              listStyleType: 'upper-roman',
            },
          },
        },
      },
    },

    h1: {
      fontSize: '24px',
      fontWeight: '500',
      marginBottom: '14px',
    },
    h2: {
      fontSize: '20px',
      fontWeight: '500',
      marginBottom: '10px',
    },
    h3: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '6px',
    },
    h4: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '4px',
    },
    p: {
      lineHeight: '1.5',
      marginBottom: '15px',
    },
    blockquote: {
      borderLeft: `2px solid`,
      borderLeftColor: 'border.default',
      color: 'gray.500',
      fontStyle: 'italic',
      marginY: 'medium',
      paddingLeft: 'medium',
    },
    table: {
      border: "solid 1px #eee",
      minWidth: '500px',
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
      marginY: 'medium',
    },
    'th': {
      background: '#eee',
    },
    'td, th': {
      border: "solid 1px #ccc",
      fontSize: '12px',
      padding: '4px'
    }
  },
});
