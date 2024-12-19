import React from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import { FiDownload } from "react-icons/fi";

const ExportProject = () => {
  const { projectId } = useParams();
  const userEmail = localStorage.getItem('user');

  const handleExport = async () => {
    try {
      // Fetch project data
      const projectDoc = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectDoc);
      if (!projectSnap.exists()) {
        console.error('No such project!');
        return;
      }
      const projectData = projectSnap.data();

      // Fetch tasks data
      const tasksCollection = collection(db, 'projects', projectId, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksList = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Combine project data and tasks data
      const exportData = {
        project: projectData,
        tasks: tasksList
      };

      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create a blob from the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a link element
      const link = document.createElement('a');

      // Set the download attribute with a filename
      link.download = `${projectData.name || 'project'}_${projectId}.json`;

      // Create a URL for the blob and set it as the href attribute
      link.href = window.URL.createObjectURL(blob);

      // Append the link to the body
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Remove the link from the document
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error exporting project: ', error);
    }
  };

  return (
    <button onClick={handleExport}>
      Export Project <FiDownload />
    </button>
  );
};

export default ExportProject;