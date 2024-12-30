import React from 'react';
import { Handle } from '@xyflow/react';

const CustomNode = ({ data }) => {
  console.log(data);
  return (
    <div style={{ padding: 20, minWidth: 100, border: '1px solid #ddd', borderRadius: 5, background: '#343434', position: 'relative' }}>
      <Handle type="target" position="left" style={{ background: '#555' }} />
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: '0.8em', color: '#fff' }}>
        {data.earliestCompletion}
      </div>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        {data.label}
      </div>
      <div style={{ position: 'absolute', top: 5, right: 5, fontSize: '0.8em', color: '#fff' }}>
        {data.latestCompletion}
      </div>
      <div style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', fontSize: '0.8em', color: '#fff' }}>
        {data.completionTime}
      </div>
      <Handle type="source" position="right" style={{ background: '#555' }} />
    </div>
  );
};

export default CustomNode;