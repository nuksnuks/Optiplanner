import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Register the required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BurndownChart = ({ projectId }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Remaining Tasks',
        data: [],
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksRef = collection(db, 'projects', projectId, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);
        const tasks = tasksSnapshot.docs.map(doc => doc.data());

        // Calculate the total number of tasks and the number of completed tasks over time
        const dates = [];
        const remainingTasks = [];
        let totalTasks = tasks.length;
        let completedTasks = tasks.filter(task => task.done === "true").length;

        tasks.forEach(task => {
          const createdAt = task.createdAt.toDate().toDateString();
          if (!dates.includes(createdAt)) {
            dates.push(createdAt);
            remainingTasks.push(totalTasks - completedTasks);
          }
          if (task.done === "true") {
            completedTasks++;
          }
        });

        // Add the final state
        dates.push(new Date().toDateString());
        remainingTasks.push(totalTasks - completedTasks);

        setChartData({
          labels: dates,
          datasets: [
            {
              label: 'Remaining Tasks',
              data: remainingTasks,
              fill: false,
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(75,192,192,1)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching tasks: ', error);
      }
    };

    fetchTasks();
  }, [projectId]);

  return (
    <div>
      <h2>Burndown Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default BurndownChart;