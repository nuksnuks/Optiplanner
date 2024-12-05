import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TaskList from '../components/TaskList';
import DeleteProject from '../components/DeleteProject';
import InviteUser from '../components/InviteUser';
import LeaveProject from '../components/LeaveProject';
import BurndownChart from '../components/BurndownChart';
import { IoMdArrowBack } from "react-icons/io";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState({
    title: false,
    startDate: false,
    deadline: false,
  });
  const [categories, setCategories] = useState([]);
  const user = localStorage.getItem('user');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const projectData = docSnap.data();
          if (projectData.owner.includes(user) || projectData.collaborators.includes(user)) {
            setProject(projectData);
          } else {
            console.log('User is not a collaborator on this project.');
          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [projectId, user]);

  const handleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = async (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, { [field]: project[field] });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={handleBackClick}><IoMdArrowBack /></button>
      <h2>
        Project: {' '}
        {isEditing.title ? (
          <input
            type="text"
            name="title"
            value={project.title}
            onChange={handleChange}
            onBlur={() => handleBlur('title')}
            autoFocus
          />
        ) : (
          <span onClick={() => handleEdit('title')}>{project.title}</span>
        )}
      </h2>
      <h3>
        Period: {' '}
        {isEditing.startDate ? (
          <input
            type="date"
            name="startDate"
            value={project.startDate}
            onChange={handleChange}
            onBlur={() => handleBlur('startDate')}
            autoFocus
          />
        ) : (
          <span onClick={() => handleEdit('startDate')}>{project.startDate}</span>
        )}
        {' - '}
        {isEditing.deadline ? (
          <input
            type="date"
            name="deadline"
            value={project.deadline}
            onChange={handleChange}
            onBlur={() => handleBlur('deadline')}
            autoFocus
          />
        ) : (
          <span onClick={() => handleEdit('deadline')}>{project.deadline}</span>
        )}
      </h3> 
      <InviteUser projectId={projectId} user={user} />
      {project.owner === user ? (
        <DeleteProject />
      ) : project.collaborators.includes(user) ? (
        <LeaveProject projectId={projectId} user={user} />
      ) : null}
      <TaskList setCategories={setCategories} />
      <BurndownChart projectId={projectId} />
    </div>
  );
};

export default Project;