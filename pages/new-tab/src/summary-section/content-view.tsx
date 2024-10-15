import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { RichTextEditor } from '../elements';
import { HtmlContent } from '../html-content';
import { ckEditorContentStyles } from './styles';

type Props = {
  isEditing: boolean;
  value: string;
  onSave: (value: string) => void;
};

export const ContentView = ({ isEditing, onSave, value }: Props) => {
  const [editedValue, setEditedValue] = useState<string>('');

  if (isEditing) {
    return (
      <Box sx={{ '.ck-editor__editable': { borderWidth: 0 } }}>
        <RichTextEditor
          defaultValue={value}
          width="100%"
          height="100%"
          onChange={value => setEditedValue(value)}
          onBlur={() => onSave(editedValue)}
          isToolbarVisible={false} // Hide toolbar for summary editing
        />
      </Box>
    );
  }

  return (
    <HtmlContent
      sx={{
        ...ckEditorContentStyles,
        p: { _last: { mb: 0 } },
        pb: '60px',
      }}>
      <div className="ck-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      </div>
    </HtmlContent>
  );
};
