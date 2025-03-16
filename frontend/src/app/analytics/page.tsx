export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold font-dm-sans mb-4">Analytics Dashboard</h1>
      <p className="text-lg font-inter mb-6">
        View aggregate analytics for instrument values
      </p>
      
      {/* Your analytics content will go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background-secondary p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Summary</h2>
          <p>Analytics data will be displayed here</p>
        </div>
      </div>
    </div>
  );
}