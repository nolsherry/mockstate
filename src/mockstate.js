; (function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = {
      dispatch: factory().dispatch
      , getState: factory().getState
      , setState: factory().setState
      , setActions: factory().setActions
      , subscribe: factory().subscribe
      , middleware: factory().middleware
      , unsubscribe: factory().unsubscribe
    }
  } else {
    root.Mockstate = factory();
  }
} (this, function () {
  'use strict';
  /**
   * @name Mockstate
   * @description The object that will manage all application state
   */
  let Mockstate = {
    /**
     * Persists the store state on localStorage
     * @name localState
     */
    localState: {
      /**
       * @name recoveryStateWhenOffline
       * @description When the user will be offline, keep the store state safe.
       */
      recoveryStateWhenOffline: () => {
        /**
         * When the page reloads, if the recovery state are present
         * recovery the store state.
         */
        window.addEventListener("load", () => {
          // verify if the recored state are present when the page loads
          if (localStorage.getItem('mockstate:StateToRecovery') !== null) {
            Mockstate.mockStoreState = JSON.parse(localStorage.getItem('mockstate:StateToRecovery'));
            // remove the temporary recovery state
            localStorage.removeItem('mockstate:StateToRecovery');
          };
        })

        // if the network connection back whithout the user reload the page, 
        // recovery the  state.
        window.addEventListener('online', (e) => {
          let recoveredState = JSON.parse(localStorage.getItem('mockstate:StateToRecovery'));
          Mockstate.mockStoreState = recoveredState;
          localStorage.setItem('mockstate:LocalState', recoveredState);

          // remove the temporary recovery state
          localStorage.removeItem('mockstate:StateToRecovery');
        });

        window.addEventListener('offline', (e) => {
          /**
           * when the network connection is offline, store the actual
           * state on localStorage to be recovered when the connection
           * become without reload the page or when reload in the same route,
           * keeping the state and UI component safe.
           */
          localStorage.setItem('mockstate:StateToRecovery', JSON.stringify(Mockstate.mockStoreState));
        });
      },
      /**
       * save the initial 
       */
      persistInitialStateOnLocalStorage: (state) => {
        localStorage.setItem('mockstate:LocalState', JSON.stringify(state));
      }
    },
    /**
     * The copy of initial store state, that will be used to work
     * in application. Keeping the store state immutable.
     */
    mockStoreState: {},
    /**
     * @name _store
     * @description The private store
     */
    _store: {
      /**
       * @name state
       * @description The Store application state
       */
      state: {},
      /**
       * @name actions
       * @description The Functions that will change the Store state
       */
      actions: {},
      /**
       * @name state
       * @description The Components that was subscribed
       */
      components: [],
      middleware: {}
    },
    /**
     * @name store
     * @description Public Store
     */
    store: {
      /**
       * @name subscribe
       * @description Subscribe to call the handler function when the action will be triggered
       * @param {Component} component The Component
       * @param {Function} handler The function that will be called
       **/
      subscribe: (component, handler) => {
        Mockstate._store.components.push({ component, handler });
      },
      unsubscribe: (component) => {
        let components = Mockstate._store.components;
        components.forEach(el, index => {
          if (el === component) {
            components.splice(index, 1);
          }
        });
      },
      /**
       * @name middleware
       * @description The middleware function that will be triggered
       * every time when an action called.
       * @param {Function} callback A function that will be called 
       **/
      middleware: (callback) => {
        Mockstate._store.middleware = callback;
      },
      /**
       * @name dispatch
       * @description Dispatch an action to change
       * the store state
       * @param { string } action The action name
       * @param { any } args Arguments sended to the action
       */
      dispatch: (action, ...args) => {
        let state;
        let updateStoreData = () => {
          let updateStoreState = Promise.resolve(
            Mockstate._store.actions[action].apply
              (
              null, [].concat(Mockstate.mockStoreState, args)
              )
          )
            .then(value => {
              let middleware = Mockstate._store.middleware
                , component = Mockstate._store.components
                ;

              // state that will be returned
              let state = { action, value }

              /**
               * has middleware?
               **/
              if (typeof middleware === "function") {
                middleware.call(null, state, Mockstate.mockStoreState);
              }

              component.forEach((el, i) => {
                if (el.component !== undefined && typeof el.handler === "function") {
                  el.handler(state)
                }
              });
              return state;
            });
          return updateStoreState;
        };
        return updateStoreData()
      },
      /**
       * @name setState
       * @description Sets the application data state
       * @param {object} data Simple Object that contain the State
       */
      setState: (data) => {
        // setting the immutable initial state
        let state = Object.assign(Mockstate._store.state, data);
        // // persist the initial state on localStorage
        // Mockstate.localState.persistInitialStateOnLocalStorage(state);
        Object.assign(Mockstate.mockStoreState, data);
        Mockstate.localState.recoveryStateWhenOffline();
      },
      /**
       * @name get
       * @param {string} stateName The Store state name
       */
      getState: (stateName) => {
        if (stateName === '*') {
          return Mockstate.mockStoreState;
        }
        return Mockstate.mockStoreState[stateName];
      },
      /**
       * @name setActions
       * @description Sets the application Actions
       * that will change the Store state
       */
      setActions: (data) => {
        Object.assign(Mockstate._store.actions, data);
      }
    }
  };
  return Mockstate.store;
}));