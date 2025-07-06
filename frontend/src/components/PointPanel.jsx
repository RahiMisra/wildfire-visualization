import React, { useEffect } from 'react';

function PointPanel({ point }) {
  useEffect(() => {
    console.log('Point data updated:', point);
  }, [point]);

  if (!point) return <div>No point selected</div>;

  return (
    <div>
      <h3>Point Details</h3>
      <pre>{JSON.stringify(point, null, 2)}</pre>
    </div>
  );
}

export default PointPanel;
