export default function ProgressPanel({ tasks = [] }) {
  const total = Array.isArray(tasks) ? tasks.length : 0;
  const completed = Array.isArray(tasks)
    ? tasks.filter((t) => (t.status || '') === 'done').length
    : 0;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div id="progressSummary">
      <p>
        <span id="completedTasks">{completed}</span> /{' '}
        <span id="totalTasks">{total}</span> tasks completed ·{' '}
        <span id="progressPercentage">{percentage}%</span>
      </p>
      <div className="progress-bar">
        <div id="progressBarFill" style={{ width: percentage + '%' }}></div>
      </div>
    </div>
  );
}
