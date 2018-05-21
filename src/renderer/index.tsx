import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import { App } from './App';

const loggerMiddleware = createLogger();
let store = createStore(rootReducer, applyMiddleware(loggerMiddleware));

render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app'),
);
