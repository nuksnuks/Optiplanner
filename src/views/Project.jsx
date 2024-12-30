import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDoc, doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TaskList from '../components/TaskList';
import DeleteProject from '../components/DeleteProject';
import InviteUser from '../components/InviteUser';
import LeaveProject from '../components/LeaveProject';
import EditableField from '../components/EditableField';
import TaskForm from '../components/TaskForm';
import { IoMdArrowBack } from "react-icons/io";
import { GiFinishLine } from "react-icons/gi";
import { GoRocket } from "react-icons/go";
import { PiFlowArrow } from "react-icons/pi";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  console.log(projectId);

  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState({
    title: false,
    startDate: false,
    deadline: false,
  });
  const [categories, setCategories] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [tasks, setTasks] = useState([]);
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

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects', projectId, 'tasks'));
      const tasksList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksList);

      // Extract unique categories from tasks
      const uniqueCategories = [...new Set(tasksList.map(task => task.category))];
      setCategories(uniqueCategories);

      // Fetch category order
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        setCategoryOrder(projectData.categoryOrder || uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  const handleCheckboxChange = async (taskId, currentStatus) => {
    try {
      const taskDoc = doc(db, 'projects', projectId, 'tasks', taskId);
      console.log(`Updating task: ${taskId} in project: ${projectId}`);
      await updateDoc(taskDoc, { done: currentStatus === "true" ? "false" : "true" });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, done: currentStatus === "true" ? "false" : "true" } : task
        )
      );
      fetchTasks(); // Refresh tasks to update the UI
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

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
    <>
      <div className="project-view-container">
        <div className='project-properties'>

          <div className='project-header'>
            <button className="back-btn" onClick={handleBackClick}>
              <IoMdArrowBack />
            </button>
            
          </div>
            
          <TaskForm
            fetchTasks={fetchTasks}
            categories={categories}
            taskToEdit={taskToEdit}
            setTaskToEdit={setTaskToEdit}
            setCategoryOrder={setCategoryOrder}
          />

          <Link to="./taskflow">
            The Critical Path <PiFlowArrow />
          </Link>
          {project.owner === user ? <DeleteProject /> : <LeaveProject projectId={projectId} user={user} />}
        </div>

        <div className='main-project-content'>

        <div className='project-info'>

          <div className='project-settings'>
            <EditableField
              projectId={projectId}
              field="title"
              value={project.title}
              label="Project: "
            />
            <EditableField
              projectId={projectId}
              field="startDate"
              value={project.startDate}
              label="Kickoff: "
            />
            <EditableField
              projectId={projectId}
              field="deadline"
              value={project.deadline}
              label="Deadline: "
            />
          </div>
          <InviteUser projectId={projectId} user={user} />
        </div>

        
        <TaskList
          setCategories={setCategories}
          startDate={project.startDate}
          deadline={project.deadline}
          setTaskToEdit={setTaskToEdit}
          setCategoryOrder={setCategoryOrder}
          tasks={tasks}
          handleCheckboxChange={handleCheckboxChange}
        />
        </div>
    </div>
    </>
  );
};

export default Project;