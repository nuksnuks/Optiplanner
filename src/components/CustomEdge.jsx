import React from 'react';
import { getBezierPath } from '@xyflow/react';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeColor = data.done === 'true' ? 'green' : 'red';

  return (
    <path
      id={id}
      style={{ ...style, stroke: edgeColor }}
      className="react-flow__edge-path"
      d={edgePath}
    />
  );
};

export default CustomEdge;