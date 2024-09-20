import { useState } from 'react';
import {
  Button,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

type Props = {
  initialPrompt: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: string) => void;
};

export const PromptView = ({ initialPrompt, isOpen, onClose, onSave }: Props) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit custom prompt</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Textarea
            fontSize="sm"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={20}
            placeholder="Enter your custom prompt here..."
          />
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
