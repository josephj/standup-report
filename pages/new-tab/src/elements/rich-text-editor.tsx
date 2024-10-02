import { ClassicEditor } from 'ckeditor5';
import { Box, useBoolean } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { useRef, useEffect, useMemo, useState } from 'react';

import { CKEditor } from '@ckeditor/ckeditor5-react';

import { editorConfig } from '../lib';
import { HtmlContent } from '../html-content';

type Props = BoxProps & {
  value?: string;
  defaultValue?: string;
  height?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isToolbarVisible?: boolean;
};

export const RichTextEditor = ({
  value,
  defaultValue,
  height,
  onChange,
  onBlur,
  isToolbarVisible = true,
  ...rest
}: Props) => {
  const [isLayoutReady, setLayoutReady] = useBoolean();
  const editorInstanceRef = useRef<ClassicEditor | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setLayoutReady.on();
    return () => setLayoutReady.off();
  }, [setLayoutReady]);

  useEffect(() => {
    if (value !== undefined && editorInstanceRef.current && editorInstanceRef.current.getData() !== value) {
      editorInstanceRef.current.setData(value);
    }
  }, [value]);

  const config = useMemo(
    () => ({
      ...editorConfig,
      toolbar: isToolbarVisible ? editorConfig.toolbar : [],
    }),
    [isToolbarVisible],
  );

  const handleChange = (_event: unknown, editor: ClassicEditor) => {
    const data = editor.getData();
    setInternalValue(data);
    onChange(data);
  };

  const handleReady = (editor: ClassicEditor) => {
    editorInstanceRef.current = editor;
    editor.setData(value !== undefined ? value : internalValue);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const sx = {
    '.ck-editor__editable_inline': {
      height: height || 'auto',
      overflowY: 'auto',
    },
    ...(isToolbarVisible
      ? {}
      : {
          '.ck-editor__top': {
            display: 'none',
          },
        }),
  };

  return (
    <Box width="fit-content" mx="auto" fontFamily="Lato" {...rest}>
      <Box ref={editorContainerRef}>
        <HtmlContent ref={editorRef} sx={sx}>
          {isLayoutReady && (
            <CKEditor
              editor={ClassicEditor}
              config={config}
              onChange={handleChange}
              onReady={handleReady}
              onBlur={handleBlur}
            />
          )}
        </HtmlContent>
      </Box>
    </Box>
  );
};
