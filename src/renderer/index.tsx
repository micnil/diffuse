import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import * as api from './common/api';
import { App } from './App';

const loggerMiddleware = createLogger();
let store = createStore(
	rootReducer,
	applyMiddleware(thunk.withExtraArgument(api), loggerMiddleware),
);

render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app'),
);
