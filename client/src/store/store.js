import { legacy_createStore as createStore} from 'redux'
import levelReducer from './reducer';

const store = createStore(levelReducer);

export default store;