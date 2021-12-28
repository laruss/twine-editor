import { configureStore } from '@reduxjs/toolkit';

import projectReducer from '../features/project/projectSlice';


export default configureStore({
    reducer: {
        project: projectReducer
    }
});