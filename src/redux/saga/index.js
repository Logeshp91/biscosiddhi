import { takeLatest } from "redux-saga/effects";
import actionType from "../actionTypes";
import postauthendicationSaga from "./postauthendication.Saga";
import postcreatevisitSaga from "./postcreatevisit.Saga";
import odooCallSaga from "./oodoCall.Saga";
import postAccessReadSaga from "./postAccessRead.Saga"; 
import postConvertSaga from "./postConvert.Saga";
import postOutstandingSaga from "./postOutstanding.Saga";
import postCustomerListSaga from "./postCustomerList.Saga";
import notificationSaga from "./notificationSaga"; 

export default function* (){
   
    yield takeLatest(actionType.POST_POSTAUTHENDICATION_REQUEST,postauthendicationSaga)
    yield takeLatest(actionType.POST_CREATEVISIT_REQUEST,postcreatevisitSaga)
    yield takeLatest(actionType.ODOO_CALL_REQUEST, odooCallSaga);
    yield takeLatest(actionType.POST_ACCESSREAD_REQUEST, postAccessReadSaga);
    yield takeLatest(actionType.POST_CONVERT_REQUEST, postConvertSaga);
    yield takeLatest(actionType.POST_OUTSTANDING_REQUEST, postOutstandingSaga);
    yield takeLatest(actionType.POST_CUSTOMERLIST_REQUEST, postCustomerListSaga);
    notificationSaga();
}