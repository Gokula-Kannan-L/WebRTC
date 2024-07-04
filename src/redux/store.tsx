import {configureStore} from '@reduxjs/toolkit';
import meetingReducer from './meetingSlice';

const store =  configureStore({
    reducer: {
        meeting: meetingReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false 
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;

