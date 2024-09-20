import { ClassicEditor } from 'ckeditor5';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
} from '@chakra-ui/react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import { editorConfig } from './lib';
import { HtmlContent } from './html-content';

type Props = {
  initialPrompt: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: string) => void;
};

export const PromptView = ({ initialPrompt, isOpen, onClose, onSave }: Props) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  console.log('prompt :', prompt);
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const config = {
    ...editorConfig,
    initialData: prompt,
  };

  const handleChange = (event: Event, editor: ClassicEditor) => {
    const data = editor.getData();
    setPrompt(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit custom prompt</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box width="fit-content" mx="auto" fontFamily="Lato">
            <Box ref={editorContainerRef}>
              <HtmlContent
                ref={editorRef}
                sx={{ '.ck-editor__editable_inline': { height: '500px', overflowY: 'auto' } }}>
                {isLayoutReady && (
                  <CKEditor data={prompt} editor={ClassicEditor} config={config} onChange={handleChange} />
                )}
              </HtmlContent>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" mr={3} onClick={() => onSave(prompt)}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
