export const ckEditorContentStyles = {
  '.ck-content': {
    fontFamily: 'Lato, sans-serif',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginBottom: '0.5em',
    },
    '& p': { marginBottom: '1em' },
    '& ul, & ol': { paddingLeft: '2em', marginBottom: '1em' },
    '& ul ul, & ol ol, & ul ol, & ol ul': { paddingLeft: '2em', marginBottom: '0' },
    '& a': { color: '#0066cc', textDecoration: 'underline' },
    '& blockquote': {
      borderLeft: '4px solid #ccc',
      paddingLeft: '1em',
      marginLeft: '0',
      fontStyle: 'italic',
    },
    '& code': {
      fontFamily: 'monospace',
      backgroundColor: '#f0f0f0',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
    },
  },
};
