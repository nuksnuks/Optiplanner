import React from 'react';
import { Handle } from '@xyflow/react';

const CustomNode = ({ data }) => {
    return (
        <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5, background: '#fff' }}>
            <Handle type="target" position="left" style={{ background: '#555' }} />
            <div>{data.label}</div>
            <Handle type="source" position="right" style={{ background: '#555' }} />
    
    </div>
  );
};

export default CustomNode;