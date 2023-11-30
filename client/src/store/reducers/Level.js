const initialState = {
    curLvl: 0,
};
  
const levelReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_LEVEL':
      return {
        ...state,
        curLvl: action.payload,
      };
    default:
      return state;
  }
};

export default levelReducer;  