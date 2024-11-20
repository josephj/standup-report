export const connectGoogleCalendar = async (): Promise<boolean> => {
  return new Promise(resolve => {
    chrome.identity.getAuthToken(
      { interactive: true, scopes: ['https://www.googleapis.com/auth/calendar.readonly'] },
      function (token) {
        if (chrome.runtime.lastError || !token) {
          console.error('Error getting auth token:', chrome.runtime.lastError);
          resolve(false);
        } else {
          console.log('Google Calendar auth token obtained successfully');
          chrome.storage.local.set({ googleCalendarToken: token }, () => {
            if (chrome.runtime.lastError) {
              console.error('Error saving token to storage:', chrome.runtime.lastError);
              resolve(false);
            } else {
              console.log('Google Calendar token saved to storage');
              resolve(true);
            }
          });
        }
      },
    );
  });
};

export const disconnectGoogleCalendar = async (): Promise<boolean> => {
  return new Promise(resolve => {
    chrome.identity.getAuthToken({ interactive: false }, function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error('Error getting auth token:', chrome.runtime.lastError);
        resolve(false);
      } else {
        chrome.identity.removeCachedAuthToken({ token }, async function () {
          try {
            const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            });

            if (response.ok) {
              chrome.storage.local.remove('googleCalendarToken', () => {
                console.log('Google Calendar token removed from storage');
                resolve(true);
              });
            } else {
              console.error('Failed to revoke token');
              resolve(false);
            }
          } catch (error) {
            console.error('Error revoking token:', error);
            resolve(false);
          }
        });
      }
    });
  });
};
