import actionTypes from "../actionTypes";

const initialState = {
  list: [],
};

export default function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        list: [action.payload, ...state.list],
      };

    default:
      return state;
  }
}
