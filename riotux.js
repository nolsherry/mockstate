  !function(e,n){"function"==typeof define&&define.amd?define([],n):"undefined"!=typeof module?module.exports=n:e.riotux=n()}(this,
   function ( ) {
    /*!
    --------------------------------
    riotux.js 
    --------------------------------
    + https://luisvinicius167.github.io/riotux/
    + Copyright 2016 Luis Vinícius
    + Licensed under the MIT license
    + Documentation: https://github.com/luisvinicius167/riotux
  */
    'use strict';
    
    /**
     * @name  _currentState
     * @description The current state for state that will be changed
     */
    var _currentState;
    /**
     * @actionName  the store state and mutations
     * @type { Object }
     */
    var _store = {
      dispatch: function ( stateName, actionName ) {
        var _slice = Array.prototype.slice.call(arguments, 2)
          , state = [_store.state]
          , args = state.concat(_slice)
        ;
          _store.mutations[actionName].apply(null, args)
           return _store.update(stateName, actionName);
        },
      /**
       * [tags contain all tags and states]
       * @type {Array}
       */
      tags: [],
      /**
       * @name  subscribe
       * @description Add the tag and the states for the tag
       * update when the states changes
       * @param  { Component instance } component Your component
       * @param  { array } states Array that contain the states
       */
      subscribe: function ( component, states, handler ) {
        _store.tags.push({ component: component, states: states, handler:handler });
      },
      /**
       * @name  unsubscribe
       * @description Unsubscribre the component for states changes
       * @param  { Component instance } tag Your component
       */
      unsubscribe: function ( tag ) {
        _store.tags.forEach(function( el, i ) { 
          if ( el.component === tag ) {
            _store.tags.splice(i, 1);
          }
        });
      },
      /**
       * @name update
       * @description Execute the component handler, because the state changed
       */
      update: function ( stateName, actionName ) {
        _store.tags.forEach(function ( el, index, arr ) {
          if ( el.states.indexOf(stateName) !== -1 ) {
            if (typeof el.handler === "function") {
              el.handler( stateName, _store.state[stateName], actionName );
            }
          }
        });
      }
    };
    /**
     * @desc Central State management inspired in Redux and Flux pattern
     * @function riotux
     */
    function riotux ( ) {
      /**
       * @name actions
       * @description All actions for components call
       * @type {Object}
       */
      this.actions = {};
    };

    riotux.prototype = {
      /**
       * @name subscribe
       * @description subscribe the tag to update when the states changes
       * @param  { String } [component] The Component instance
       * @param { Array } states The states that your component listen
       * @param { Function } handler The function that you use to update your component when the each state change
       */
      subscribe: function ( component, states, handler ) {
        _store.subscribe(component, states, handler);
      },
      /**
       * @name unsubscribe
       * @description unsubscribe component for states changes
       * @param  { string } component The Component instance
       */
      unsubscribe: function ( component ) {
        _store.unsubscribe(component);
      },
      /**
       * @name Store
       * @param  { object } data The data that contain the store mutations and state
       * @return { object } Return the store
       */
      Store: function ( data ) {
        _store = Object.assign(_store, data);
      },  
      /**
       * @name  Actions
       * @param  { object } data The data that contain all actions
       * @return { object } Return actions
       */
      Actions: function ( data ) {
        this.actions = data;
        return this.actions;
      },
      /**
       * @name action
       * @description Emit an action for store dispatcher to change the state
       * @return { void }
       */
      action: function ( ) {
        _currentState = arguments[0];
        // pass just the method dispatch to action
        var stateName = arguments[0]
          , store_to_action = { dispatch: function(){
                    Array.prototype.unshift.call(arguments, stateName);
                    _store.dispatch.apply(null, arguments);
                }}
          , store = [store_to_action]
          , args
        ;
        if (_store.state[_currentState] !== undefined ) {
          args = store.concat(Array.prototype.slice.call(arguments, 2));
          this.actions[arguments[1]].apply(null, args);
        } else {
          args = store.concat(Array.prototype.slice.call(arguments, 1));
          this.actions[arguments[0]].apply(null, args);
        }
      },
      /**
       * @name get
       * @param  { string } name The name of state
       */
      get: function ( name ) {
        return _store.state[name];
      }
    };
    return new riotux();
  });
