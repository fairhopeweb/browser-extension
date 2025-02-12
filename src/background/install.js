import { chromeAPI } from './chrome-api';
import { Extension } from './extension';

export async function init() {
  const extension = new Extension();

  extension.listen();

  chromeAPI.runtime.onInstalled.addListener(async installDetails => {
    // Check whether this is the inital installation or an update of an existing
    // installation.
    if (installDetails.reason === 'install') {
      const extensionInfo = await chromeAPI.management.getSelf();
      extension.firstRun(extensionInfo);
    }
    extension.install();
  });

  // Respond to messages sent by the JavaScript from https://hyp.is.
  // This is how it knows whether the user has this Chrome extension installed.
  chromeAPI.runtime.onMessageExternal.addListener(
    (request, sender, sendResponse) => {
      if (request.type === 'ping') {
        sendResponse({ type: 'pong' });
      }
    }
  );

  chromeAPI.runtime.requestUpdateCheck?.().then(() => {
    chromeAPI.runtime.onUpdateAvailable.addListener(() =>
      chromeAPI.runtime.reload()
    );
  });
}
