import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  HStack,
} from '@chakra-ui/react';
import { faGoogle, faJira, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCog, faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { GCalSettings } from './gcal-settings';
import { GeneralSettings } from './general-settings';
import { GitHubSettings } from './github-settings';
import { JiraSettings } from './jira-settings';
import { ModelSettings } from './model-settings';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export const SettingsView = ({ isOpen, onClose }: Props) => (
  <Modal isOpen={isOpen} onClose={onClose} size="2xl">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <FontAwesomeIcon icon={faCog} fixedWidth /> Settings
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Tabs variant="enclosed">
          <TabList>
            <Tab>
              <HStack>
                <FontAwesomeIcon icon={faCog} fixedWidth />
                <Text>General</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FontAwesomeIcon icon={faGithub} fixedWidth />
                <Text>GitHub</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FontAwesomeIcon icon={faJira} fixedWidth />
                <Text>Jira</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FontAwesomeIcon icon={faGoogle} fixedWidth />
                <Text>Calendar</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FontAwesomeIcon icon={faRobot} fixedWidth />
                <Text>AI Model</Text>
              </HStack>
            </Tab>
          </TabList>
          <TabPanels minH="400px">
            <TabPanel>
              <GeneralSettings />
            </TabPanel>
            <TabPanel>
              <GitHubSettings />
            </TabPanel>
            <TabPanel>
              <JiraSettings />
            </TabPanel>
            <TabPanel>
              <GCalSettings />
            </TabPanel>
            <TabPanel>
              <ModelSettings />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>
    </ModalContent>
  </Modal>
);
