import { combineReducers } from "redux";
import postauthendicationReducer from "./postauthendication.Reducer";
import postcreatevisitReducer from "./postcreatevisit.Reducer";
import odooReducer from "./oodo.Reducer";
import postAccessReadReducer from "./postAccessRead.Reducer";
import postConvertReducer from "./postConvert.Reducer";
import postOutstandingReducer from "./postOutstanding.Reducer";
import postCustomerListReducer from "./postCustomerList.Reducer";
import notificationReducer from "./notificationReducer";
const reducer =combineReducers({


postauthendicationReducer,   
postcreatevisitReducer,
odooReducer,
postAccessReadReducer,
postConvertReducer,
postOutstandingReducer,
postCustomerListReducer,
notificationReducer,
})

export default reducer;