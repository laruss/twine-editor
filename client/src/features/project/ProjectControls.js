import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { projectLoaded } from "./projectSlice";

export const ProjectControls = () => {
    const project = useSelector(state => state.project);
    
    const [projectName, setProjectName] = useState(project.projectName);
    const [projectPath, setProjectPath] = useState(project.projectPath);
    const [pathFormIsShown, changePathFormState] = useState(false);

    const dispatch = useDispatch();

    const showPathForm = () => changePathFormState(true);
    const onPathInputChange = e => setProjectPath(e.target.value);

    const onLoadProjectClick = () => { 
        // TODO: add condition to check project path
        if (projectPath) {
            dispatch(projectLoaded(projectPath));
            changePathFormState(false);
            setProjectPath('');
        };
    };

    const projectInit = <div className="project-init project-controls">
        <button className="load-project-btn" onClick={showPathForm}>Load Project</button>
        <button className="start-project-btn">Start Project</button>
        <button className="about-project-btn">About</button>
    </div>

    const loadingForm = <div>
        <input type="text" id="pathInput" name="pathInput" value={projectPath} onChange={onPathInputChange}/>
        <button className="load-load-btn">➔</button>
    </div>

    return (
        <div>
            {projectName ? <div></div> : projectInit}
            {pathFormIsShown ? loadingForm : <div></div>}
        </div>
    );
};