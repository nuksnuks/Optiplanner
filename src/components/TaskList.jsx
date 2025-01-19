import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import TaskItem from './TaskItem';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TaskList = ({ setCategories = () => {}, startDate = '', deadline = '', setTaskToEdit, setCategoryOrder, categories = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [categoryOrder, setCategoryOrderState] = useState([]);
  const { projectId } = useParams();
  const userEmail = localStorage.getItem('user');
  const [sprintDates, setSprintDates] = useState([]);
  const [taskCompletionTimes, setTaskCompletionTimes] = useState({});

  const fetchTasks = async () => {

    try {
      const projectDoc = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectDoc);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        if (projectData.owner.includes(userEmail) || projectData.collaborators.includes(userEmail)) {
          const querySnapshot = await getDocs(collection(db, 'projects', projectId, 'tasks'));
          const tasksList = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let createdAt;
            if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else if (data.createdAt && data.createdAt.seconds) {
              createdAt = new Date(data.createdAt.seconds * 1000);
            } else if (data.createdAt && data.createdAt.toDate) {
              createdAt = data.createdAt.toDate();
            } else {
              createdAt = new Date(data.createdAt);
            }
            return {
              id: doc.id,
              ...data,
              createdAt: createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) // Convert Timestamp to dd/mm-yy format
            };
          });
          setTasks(tasksList);

          // Extract unique categories from tasks
          const uniqueCategories = [...new Set(tasksList.map(task => task.category))];
          setCategories(uniqueCategories);

          // Initialize category order from Firestore or unique categories
          let initialCategoryOrder = projectData.categoryOrder || uniqueCategories;
          initialCategoryOrder = initialCategoryOrder.filter(category => 
            tasksList.some(task => task.category === category)
          );
          setCategoryOrderState(initialCategoryOrder);
          setCategoryOrder(initialCategoryOrder);

          // Calculate project period
          const start = new Date(startDate.split('/').reverse().join('-'));
          const end = new Date(deadline.split('/').reverse().join('-'));


          const projectPeriod = (end - start) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
       

          // Calculate sprint period
          const sprintPeriod = projectPeriod / initialCategoryOrder.length;
        

          // Calculate sprint start and end dates
          const sprintDates = initialCategoryOrder.map((_, index) => {
            const sprintStartDate = new Date(start);
            sprintStartDate.setDate(start.getDate() + index * sprintPeriod);
            const sprintEndDate = new Date(sprintStartDate);
            sprintEndDate.setDate(sprintEndDate.getDate() + sprintPeriod - 1);
            return {
              start: sprintStartDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
              end: sprintEndDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
            };
          });

          // Adjust the end date of the last sprint to be the project deadline
          if (sprintDates.length > 0) {
            sprintDates[sprintDates.length - 1].end = end.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
          }

          setSprintDates(sprintDates);

          // Calculate estimated task completion time for each category
          const taskCompletionTimes = {};
          initialCategoryOrder.forEach(category => {
            const tasksInCategory = tasksList.filter(task => task.category === category);
            const incompleteTasksInCategory = tasksInCategory.filter(task => task.done !== "true").length;
            let completionTime = sprintPeriod / tasksInCategory.length;
            if (completionTime % 1 !== 0) {
              completionTime = (completionTime * 24).toFixed(2) + ' hours';
              if (parseFloat(completionTime) > 24) {
                completionTime = (parseFloat(completionTime) / 24).toFixed(2) + ' days';
              }
            } else {
              completionTime = completionTime + ' days';
            }
            taskCompletionTimes[category] = completionTime;
          });

          setTaskCompletionTimes(taskCompletionTimes);

          // Calculate earliest and latest completion times for each task
          const tasksWithCompletionTimes = tasksList.map(task => {
            const categoryIndex = initialCategoryOrder.indexOf(task.category);
            const sprintStartDate = new Date(start);
            sprintStartDate.setDate(start.getDate() + categoryIndex * sprintPeriod);
            const sprintEndDate = new Date(sprintStartDate);
            sprintEndDate.setDate(sprintEndDate.getDate() + sprintPeriod - 1);
            return {
              ...task,
              earliestCompletion: sprintStartDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
              latestCompletion: sprintEndDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
              completionTime: taskCompletionTimes[task.category]
            };
          });

          setTasks(tasksWithCompletionTimes);

          // Store task completion times and sprint periods in Firestore
          await updateDoc(projectDoc, { taskCompletionTimes, sprintPeriods: sprintDates, categoryOrder: initialCategoryOrder });

          // Update each task document with completion times
          for (const task of tasksWithCompletionTimes) {
            const taskDoc = doc(db, 'projects', projectId, 'tasks', task.id);
            await updateDoc(taskDoc, {
              earliestCompletion: task.earliestCompletion,
              latestCompletion: task.latestCompletion,
              completionTime: task.completionTime
            });
          }
        } else {

        }
      } else {
     
      }
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  const watchTasksAndCategories = () => {
    const updatedCategoryOrder = categoryOrder.filter(category => 
      tasks.some(task => task.category === category)
    );

    if (updatedCategoryOrder.length !== categoryOrder.length) {
      setCategoryOrderState(updatedCategoryOrder);

      // Save the updated category order to Firestore
      const projectDoc = doc(db, 'projects', projectId);
      updateDoc(projectDoc, { categoryOrder: updatedCategoryOrder })
      .catch(error => console.error('Error updating category order: ', error));
    }
  };

  useEffect(() => {
    fetchTasks();

  }, [projectId, userEmail]);

  useEffect(() => {
    watchTasksAndCategories();
  }, [tasks, categories]);

  const handleCheckboxChange = async (taskId, currentStatus) => {
    try {
      const taskDoc = doc(db, 'projects', projectId, 'tasks', taskId);

      await updateDoc(taskDoc, { done: currentStatus === "true" ? "false" : "true" });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, done: currentStatus === "true" ? "false" : "true" } : task
        )
      );
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) {
      return;
    }

    try {
      const taskDoc = doc(db, 'projects', projectId, 'tasks', taskId);
      await deleteDoc(taskDoc);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || result.source.droppableId !== 'incomplete-categories') return;

    const newCategoryOrder = Array.from(categoryOrder);
    const [movedCategory] = newCategoryOrder.splice(result.source.index, 1);
    newCategoryOrder.splice(result.destination.index, 0, movedCategory);

    setCategoryOrderState(newCategoryOrder);
    setCategoryOrder(newCategoryOrder);

    // Save the new category order to Firestore
    try {
      const projectDoc = doc(db, 'projects', projectId);
      await updateDoc(projectDoc, { categoryOrder: newCategoryOrder });

      // Recalculate sprint dates after reordering categories
      const start = new Date(startDate.split('/').reverse().join('-'));
      const sprintPeriod = (new Date(deadline.split('/').reverse().join('-')) - start) / (1000 * 60 * 60 * 24) / newCategoryOrder.length;
      const newSprintDates = newCategoryOrder.map((_, index) => {
        const sprintStartDate = new Date(start);
        sprintStartDate.setDate(start.getDate() + index * sprintPeriod);
        const sprintEndDate = new Date(sprintStartDate);
        sprintEndDate.setDate(sprintEndDate.getDate() + sprintPeriod - 1);
        return {
          start: sprintStartDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
          end: sprintEndDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
        };
      });

      if (newSprintDates.length > 0) {
        newSprintDates[newSprintDates.length - 1].end = new Date(deadline.split('/').reverse().join('-')).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
      }

      setSprintDates(newSprintDates);
 

      // Store the updated sprint periods in Firestore
      await updateDoc(projectDoc, { sprintPeriods: newSprintDates });
    } catch (error) {
      console.error('Error updating category order: ', error);
    }
    location.reload();
  };

  // Group tasks by category and completion status
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.done === "true" ? 'completed' : 'incomplete';
    if (!acc[key]) {
      acc[key] = {};
    }
    if (!acc[key][task.category]) {
      acc[key][task.category] = [];
    }
    acc[key][task.category].push(task);
    return acc;
  }, { completed: {}, incomplete: {} });

  return (
    <>
      <div className='task-board'>
        <div className='tasks-container'>
          <DragDropContext onDragEnd={handleDragEnd}>
            {categoryOrder.length > 0 && (
              <>
                <Droppable droppableId="incomplete-categories" direction="horizontal" type="CATEGORY">
                  {(provided) => (
                    <div
                      className='status-container'
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <h2>To-Do</h2>
                      <div className='category-list'>
                      {categoryOrder.map((category, index) => (
                        groupedTasks.incomplete[category] && groupedTasks.incomplete[category].length > 0 && (
                          <Draggable key={`incomplete-${category}`} draggableId={`incomplete-${category}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='category-board'
                              >
                                <h3>Sprint {index + 1}: {category}</h3>
                                <p>{sprintDates[index]?.start} - {sprintDates[index]?.end}</p>
                                <p>max time per task: {taskCompletionTimes[category]}</p>
                                <ul className='task-container'>
                                  {groupedTasks.incomplete[category].map((task, index) => (
                                    <TaskItem
                                      key={task.id}
                                      task={task}
                                      handleCheckboxChange={handleCheckboxChange}
                                      handleDeleteTask={handleDeleteTask}
                                      fetchTasks={fetchTasks}
                                      categories={categoryOrder}
                                    />
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Draggable>
                        )
                      ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <Droppable droppableId="completed-categories" direction="horizontal" type="CATEGORY" isDropDisabled={true}>
                  {(provided) => (
                    <div
                      className='status-container'
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <h2>Completed Tasks</h2>
                      <div className='category-list'>
                      {categoryOrder.map((category, index) => (
                        groupedTasks.completed[category] && groupedTasks.completed[category].length > 0 && (
                          <Draggable key={`completed-${category}`} draggableId={`completed-${category}`} index={index} isDragDisabled={true}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='category-board'
                              > 
                                <div>
                                  <h3>Sprint {index + 1}: {category}</h3>
                                  <p>{sprintDates[index]?.start} - {sprintDates[index]?.end}</p>
                                </div>
                                <ul className='task-container'>
                                  {groupedTasks.completed[category].map((task, index) => (
                                    <TaskItem
                                      key={task.id}
                                      task={task}
                                      handleCheckboxChange={handleCheckboxChange}
                                      handleDeleteTask={handleDeleteTask}
                                      fetchTasks={fetchTasks}
                                      categories={categoryOrder}
                                    />
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Draggable>
                        )
                      ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </>
            )}
          </DragDropContext>
        </div>
      </div>
    </>
  );
};

export default TaskList;