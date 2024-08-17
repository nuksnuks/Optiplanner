import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const Project = () => {
  const { projectId } = useParams();

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
        const docRef = doc(db, user, projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject(docSnap.data());
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
      const docRef = doc(db, user, projectId);
      await updateDoc(docRef, { [field]: project[field] });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
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
      <TaskForm fetchTasks={() => {}} categories={categories} />
      <TaskList setCategories={setCategories} />
    </div>
  );
};

export default Project;