function HoverPanel({ point }) {
  if (!point) return <div>No point selected</div>;

  return (
    <div>
      <h3>Selected Point</h3>
      <pre>{JSON.stringify(point, null, 2)}</pre>
    </div>
  );
}

export default HoverPanel;