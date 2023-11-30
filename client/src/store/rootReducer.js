import { combineReducers } from 'redux';
import levelReducer from './reducers/Level';

const rootReducer = combineReducers({
  lvl: levelReducer,
});

export default rootReducer;