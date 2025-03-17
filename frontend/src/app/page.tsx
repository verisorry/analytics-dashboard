import Dashboard from "@/app/dashboard";

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center w-auto p-6 py-[10%]">
      <div className="w-[80%] flex flex-col gap-6">
        <Dashboard />
      </div>
    </div>
  );
}
