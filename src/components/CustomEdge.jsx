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
    <>
      {/* Invisible hitbox path */}
      <path
        id={`${id}-hitbox`}
        style={{ ...style, stroke: 'transparent', strokeWidth: 10 }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      {/* Visible path */}
      <path
        id={id}
        style={{ ...style, stroke: edgeColor, strokeWidth: 2 }}
        className="react-flow__edge-path"
        d={edgePath}
      />
    </>
  );
};

export default CustomEdge;