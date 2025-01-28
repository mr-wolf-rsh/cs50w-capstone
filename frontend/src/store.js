import { configureStore } from '@reduxjs/toolkit';

import {
  alertReducer,
  authReducer,
  candidateReducer,
  commonReducer,
  partyReducer,
  pollReducer,
  registrationReducer
} from './slices';

export default configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer,
    candidate: candidateReducer,
    common: commonReducer,
    party: partyReducer,
    poll: pollReducer,
    registration: registrationReducer,
  }
});
