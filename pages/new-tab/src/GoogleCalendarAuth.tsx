import React from 'react';
import { Button } from '@chakra-ui/react';

interface GoogleCalendarAuthProps {
  onAuthComplete: (token: string) => void;
}

export const GoogleCalendarAuth: React.FC<GoogleCalendarAuthProps> = ({ onAuthComplete }) => {
  const handleAuth = () => {
    if (chrome.identity && chrome.identity.getAuthToken) {
      chrome.identity.getAuthToken({ interactive: true }, token => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (token) {
          onAuthComplete(token);
        }
      });
    } else {
      console.error('chrome.identity.getAuthToken is not available');
      // 可以在这里添加一个回退方法或显示错误消息
    }
  };

  return (
    <Button onClick={handleAuth} colorScheme="gray" size="sm">
      Authorize Google Calendar
    </Button>
  );
};
