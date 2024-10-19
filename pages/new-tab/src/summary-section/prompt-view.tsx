import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useState } from 'react';

import { RichTextEditor } from '../elements';

type Props = {
  initialPrompt: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: string) => void;
};

export const PromptView = ({ initialPrompt, isOpen, onClose, onSave }: Props) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);

  const handleChange = (value: string) => {
    setPrompt(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit custom prompt</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <RichTextEditor defaultValue={prompt} height="500px" onChange={handleChange} />
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
