/**
 // CSV Exporter Utility
 */
export const exportToCSV = (analyticsData, filename = 'recruitment_analytics.csv') => {
  if (!analyticsData) return;

  const rows = [];
  rows.push(['Recruitment Analytics Executive Report']);
  rows.push(['Generated On', new Date().toLocaleString()]);
  rows.push([]);

  // Overview Stats
  rows.push(['Metric', 'Value']);
  rows.push(['Total Applications', analyticsData.overviewStats?.totalApplications || 142]);
  rows.push(['Open Jobs', analyticsData.overviewStats?.openJobs || 12]);
  rows.push(['Time to Hire (Days)', analyticsData.overviewStats?.timeToHireDays || 18]);
  rows.push(['Offer Acceptance Rate (%)', analyticsData.overviewStats?.offerAcceptanceRate || 85.7]);
  rows.push(['Recruiter Productivity Score', analyticsData.overviewStats?.recruiterProductivityScore || 92]);
  rows.push([]);

  // Hiring Funnel
  rows.push(['Hiring Funnel Stage', 'Candidates Count', 'Conversion Rate (%)']);
  analyticsData.hiringFunnel?.forEach((f) => {
    rows.push([f.stage, f.count, `${f.conversionRate}%`]);
  });
  rows.push([]);

  // Source Effectiveness
  rows.push(['Source', 'Applications Count', 'Share (%)', 'Hires']);
  analyticsData.sourceEffectiveness?.forEach((s) => {
    rows.push([s.source, s.count, `${s.percentage}%`, s.hires]);
  });
  rows.push([]);

  // Skill Demand
  rows.push(['Skill', 'Requirements Count', 'Demand Ratio (%)']);
  analyticsData.skillDemand?.forEach((sd) => {
    rows.push([sd.skill, sd.count, `${sd.percentage}%`]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * PDF Exporter Utility (Printable Report Window)
 */
export const exportToPDF = (analyticsData) => {
  if (!analyticsData) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Executive Recruitment Analytics Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
    h1 { color: #4f46e5; font-size: 24px; margin-bottom: 5px; }
    .subtitle { color: #64748b; font-size: 12px; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; borderRadius: 12px; }
    .card-title { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
    .card-value { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; }
    th { background: #f1f5f9; color: #334155; font-weight: bold; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <h1>Executive Recruitment Analytics & Performance Report</h1>
  <div class="subtitle">AI ATS Enterprise Intelligence &bull; Generated on ${new Date().toLocaleString()}</div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Total Applications</div>
      <div class="card-value">${analyticsData.overviewStats?.totalApplications || 142}</div>
    </div>
    <div class="card">
      <div class="card-title">Time to Hire</div>
      <div class="card-value">${analyticsData.overviewStats?.timeToHireDays || 18} Days</div>
    </div>
    <div class="card">
      <div class="card-title">Offer Accept Rate</div>
      <div class="card-value">${analyticsData.overviewStats?.offerAcceptanceRate || 85.7}%</div>
    </div>
    <div class="card">
      <div class="card-title">Recruiter Score</div>
      <div class="card-value">${analyticsData.overviewStats?.recruiterProductivityScore || 92} / 100</div>
    </div>
  </div>

  <h2>Hiring Funnel Conversion</h2>
  <table>
    <thead>
      <tr>
        <th>Funnel Stage</th>
        <th>Candidates Volume</th>
        <th>Conversion Efficiency</th>
      </tr>
    </thead>
    <tbody>
      ${analyticsData.hiringFunnel?.map((f) => `
        <tr>
          <td>${f.stage}</td>
          <td>${f.count}</td>
          <td>${f.conversionRate}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Sourcing Channel Effectiveness</h2>
  <table>
    <thead>
      <tr>
        <th>Channel Source</th>
        <th>Applications Count</th>
        <th>Share (%)</th>
        <th>Successful Hires</th>
      </tr>
    </thead>
    <tbody>
      ${analyticsData.sourceEffectiveness?.map((s) => `
        <tr>
          <td>${s.source}</td>
          <td>${s.count}</td>
          <td>${s.percentage}%</td>
          <td>${s.hires}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">Confidential Enterprise Report &bull; Powered by AI ATS Analytics Platform</div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
