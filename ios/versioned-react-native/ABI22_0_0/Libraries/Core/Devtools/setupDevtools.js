/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule setupDevtools
 * @flow
 */
'use strict';

type DevToolsPluginConnection = {
  isAppActive: () => boolean,
  host: string,
  port: number,
};

type DevToolsPlugin = {
  connectToDevTools: (connection: DevToolsPluginConnection) => void,
};

let register = function () {
  // noop
};

if (__DEV__) {
  const AppState = require('../../AppState/AppState');
  const WebSocket = require('../../WebSocket/WebSocket');
  const {PlatformConstants} = require('../../BatchedBridge/NativeModules');
  const reactDevTools = require('react-devtools-core');

  register = function (plugin: DevToolsPlugin) {
    // Initialize dev tools only if the native module for WebSocket is available
    if (WebSocket.isAvailable) {
      // Don't steal the DevTools from currently active app.
      // Note: if you add any AppState subscriptions to this file,
      // you will also need to guard against `AppState.isAvailable`,
      // or the code will throw for bundles that don't have it.
      const isAppActive = () => AppState.currentState !== 'background';

      // Special case: Genymotion is running on a different host.
      const host = PlatformConstants && PlatformConstants.ServerHost ?
        PlatformConstants.ServerHost.split(':')[0] :
        'localhost';

      plugin.connectToDevTools({
        isAppActive,
        host,
        // Read the optional global variable for backward compatibility.
        // It was added in https://github.com/facebook/react-native/commit/bf2b435322e89d0aeee8792b1c6e04656c2719a0.
        port: window.__REACT_DEVTOOLS_PORT__,
        resolveRNStyle: require('../../StyleSheet/flattenStyle'),
      });
    }
  };

  register(reactDevTools);
  global.registerDevtoolsPlugin = register;
}

module.exports = {
  register,
};
