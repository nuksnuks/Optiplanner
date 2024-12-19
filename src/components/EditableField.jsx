import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const EditableField = ({ projectId, field, value, label }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setFieldValue(e.target.value);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, { [field]: fieldValue });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <div>
      <h2>
        {label}: {' '}
        {isEditing ? (
          <input
            type={field === 'startDate' || field === 'deadline' ? 'date' : 'text'}
            name={field}
            value={fieldValue}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
          />
        ) : (
          <span onClick={handleEdit}>{fieldValue}</span>
        )}
      </h2>
    </div>
  );
};

export default EditableField;