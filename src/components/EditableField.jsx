import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BsPencil } from "react-icons/bs";

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
      <h4>
      <strong>{label}</strong> {' '}
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
          <span onClick={handleEdit}>{fieldValue} <BsPencil /></span>
        )}
      </h4>
    </div>
  );
};

export default EditableField;