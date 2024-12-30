import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { IoMdArrowBack } from "react-icons/io";
import CustomNode from '../components/CustomNode';
import CustomEdge from '../components/CustomEdge';
import TaskModal from '../components/TaskModal';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const TaskFlow = () => {
  const { projectId } = useParams();
  const user = localStorage.getItem('user');
  const [tasks, setTasks] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const projectDoc = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectDoc);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        if (projectData.owner.includes(user) || projectData.collaborators.includes(user)) {
          const querySnapshot = await getDocs(collection(db, 'projects', projectId, 'tasks'));
          const tasksList = querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data();
            let createdAt;
            if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else if (data.createdAt && data.createdAt.seconds && data.createdAt.nanoseconds) {
              createdAt = new Date(data.createdAt.seconds * 1000 + data.createdAt.nanoseconds / 1000000);
            } else if (data.createdAt && data.createdAt.toDate) {
              createdAt = data.createdAt.toDate();
            } else {
              createdAt = new Date(data.createdAt);
            }
            return {
              id: docSnapshot.id,
              projectId: projectId, // Include projectId in the task object
              ...data,
              createdAt: createdAt.toDateString() // Convert Date to Date string
            };
          });
          setTasks(tasksList);

          // Extract unique categories from tasks
          const uniqueCategories = [...new Set(tasksList.map(task => task.category))];
          setCategories(uniqueCategories);

          // Fetch category order
          const categoryOrder = projectData.categoryOrder || uniqueCategories;
          setCategoryOrder(categoryOrder);

          // Group tasks by category
          const groupedTasks = tasksList.reduce((acc, task) => {
            if (!acc[task.category]) {
              acc[task.category] = [];
            }
            acc[task.category].push(task);
            return acc;
          }, {});

          // Create nodes for @xyflow/react
          const taskNodes = [];
          let xOffset = 0;
          const yOffsetIncrement = 100;
          categoryOrder.forEach((category, columnIndex) => {
            if (groupedTasks[category]) {
              groupedTasks[category].forEach((task, rowIndex) => {
                taskNodes.push({
                  id: task.id,
                  type: 'custom', // Use the custom node type
                  data: {
                    label: task.name,
                    desc: task.description,
                    done: task.done,
                    category: category,
                    earliestCompletion: task.earliestCompletion,
                    latestCompletion: task.latestCompletion,
                    completionTime: task.completionTime,
                  },
                  position: { x: xOffset, y: rowIndex * yOffsetIncrement + 50 }, // Adjust y position to leave space for the label
                });
              });
              xOffset += 250; // Increment xOffset for the next column
            }
          });

          // Fetch saved node positions from Firestore
          const nodesDoc = await getDoc(doc(db, 'projects', projectId, 'nodes', 'nodes'));
          if (nodesDoc.exists()) {
            const savedNodes = nodesDoc.data().nodes;
            savedNodes.forEach(savedNode => {
              const node = taskNodes.find(n => n.id === savedNode.id);
              if (node) {
                node.position = savedNode.position;
              }
            });
          }

          setNodes(taskNodes);

          // Fetch saved edges from Firestore
          const edgesDoc = await getDoc(doc(db, 'projects', projectId, 'edges', 'edges'));
          if (edgesDoc.exists()) {
            setEdges(edgesDoc.data().edges.map(edge => {
              const sourceNode = taskNodes.find(node => node.id === edge.source);
              return { ...edge, data: { done: sourceNode?.data?.done || 'false' } };
            }));
          }
        } else {
          console.log('User is not a collaborator on this project.');
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    console.log('Fetching tasks...', user);
  }, [projectId, user]);

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

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(node => node.id === params.source);
      const newEdge = { ...params, type: 'custom', data: { done: sourceNode?.data?.done || 'false' } };
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        saveEdges(updatedEdges);
        return updatedEdges;
      });
    },
    [setEdges, nodes],
  );

  const onEdgeClick = (event, edge) => {
    event.stopPropagation();
    setEdges((eds) => {
      const updatedEdges = eds.filter((e) => e.id !== edge.id);
      saveEdges(updatedEdges);
      return updatedEdges;
    });
  };

  const saveEdges = async (edges) => {
    try {
      await setDoc(doc(db, 'projects', projectId, 'edges', 'edges'), { edges });
    } catch (error) {
      console.error('Error saving edges: ', error);
    }
  };

  const onNodeClick = (event, node) => {
    const task = tasks.find(t => t.id === node.id);
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const saveNodes = async (nodes) => {
    try {
      await setDoc(doc(db, 'projects', projectId, 'nodes', 'nodes'), { nodes });
    } catch (error) {
      console.error('Error saving nodes: ', error);
    }
  };

  const onNodesChangeWithSave = useCallback(
    (changes) => {
      onNodesChange(changes);
      saveNodes(nodes);
    },
    [onNodesChange, nodes]
  );

  return (
    <>
      
      <div className="taskflow-container">
        <div className="taskform-container">
          <button onClick={handleBackClick} className="back-btn">
            <IoMdArrowBack />
          </button>
          <TaskForm
            fetchTasks={fetchTasks}
            categories={categories}
            taskToEdit={taskToEdit}
            setTaskToEdit={setTaskToEdit}
          />
        </div>
        <div className="reactflow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWithSave}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes} // Register the custom node type
            edgeTypes={edgeTypes} // Register the custom edge type
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
          <TaskModal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            task={selectedTask}
            refreshTasks={fetchTasks} // Pass the fetchTasks function to refresh the tasks
          />
        </div>
      </div>
    </>
  );
};

export default TaskFlow;