import { ClassicEditor } from 'ckeditor5';
import { Box, useBoolean } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { useRef, useEffect } from 'react';

import { CKEditor } from '@ckeditor/ckeditor5-react';

import { editorConfig } from '../lib';
import { HtmlContent } from '../html-content';

type Props = BoxProps & {
  defaultValue: string;
  height?: string;
  onChange: (value: string) => void;
};

export const RichTextEditor = ({ defaultValue, height, onChange, ...rest }: Props) => {
  const [isLayoutReady, setLayoutReady] = useBoolean();

  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setLayoutReady.on();
    return () => setLayoutReady.off();
  }, [setLayoutReady]);

  const config = {
    ...editorConfig,
    initialData: defaultValue,
  };

  const handleChange = (event: Event, editor: ClassicEditor) => {
    const data = editor.getData();
    onChange(data);
  };

  const sx = height
    ? {
        '.ck-editor__editable_inline': {
          height: height,
          overflowY: 'auto',
        },
      }
    : undefined;

  return (
    <Box width="fit-content" mx="auto" fontFamily="Lato" {...rest}>
      <Box ref={editorContainerRef}>
        <HtmlContent ref={editorRef} sx={sx}>
          {isLayoutReady && <CKEditor editor={ClassicEditor} config={config} onChange={handleChange} />}
        </HtmlContent>
      </Box>
    </Box>
  );
};
