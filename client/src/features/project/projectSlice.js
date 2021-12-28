import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    attributes: {},
    projectDir: '',
    projectName: '',
    projectPath: ''
};

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        projectLoaded: {
            reducer(state, action) {
                return {...state, ...action.payload}
            },
            // TODO
            prepare() {
                return {
                    payload: initialState
                }
            }
        }
    }
});

export const { projectLoaded } = projectSlice.actions;

export default projectSlice.reducer;