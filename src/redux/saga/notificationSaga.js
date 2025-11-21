import { takeLatest } from "redux-saga/effects";
import actionTypes from "../actionTypes";

function* handleNotification(action) {
  console.log("📬 Saga received notification:", action.payload);
}

export default function* notificationSaga() {
  yield takeLatest(actionTypes.ADD_NOTIFICATION, handleNotification);
}
